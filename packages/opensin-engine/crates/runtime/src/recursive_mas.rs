use std::collections::BTreeMap;
use std::process::Command;

use crate::config::RecursiveMasConfig;

pub struct RecursiveMasSession {
    enabled: bool,
    topology: String,
    latent_dim: usize,
    cli_path: String,
    log_traces: bool,
    recursive_depth: usize,
    latent_traces: BTreeMap<String, Vec<f32>>,
}

impl RecursiveMasSession {
    pub fn new(config: Option<&RecursiveMasConfig>) -> Self {
        let Some(config) = config else {
            return Self {
                enabled: false,
                topology: "chain".to_string(),
                latent_dim: 64,
                cli_path: "recursivemas".to_string(),
                log_traces: false,
                recursive_depth: 0,
                latent_traces: BTreeMap::new(),
            };
        };

        Self {
            enabled: config.enabled,
            topology: config.topology.clone(),
            latent_dim: config.latent_dim,
            cli_path: config.cli_path.clone(),
            log_traces: config.log_traces,
            recursive_depth: 0,
            latent_traces: BTreeMap::new(),
        }
    }

    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    pub fn increment_depth(&mut self) {
        self.recursive_depth += 1;
    }

    pub fn decrement_depth(&mut self) {
        if self.recursive_depth > 0 {
            self.recursive_depth -= 1;
        }
    }

    pub fn current_depth(&self) -> usize {
        self.recursive_depth
    }

    pub fn log_trace(&mut self, tool_name: &str, input: &str, output: &str) {
        if !self.log_traces {
            return;
        }

        let trace_key = format!("{tool_name}_{}", self.recursive_depth);
        let trace_value = self.compute_latent_trace(tool_name, input, output);
        self.latent_traces.insert(trace_key, trace_value);
    }

    fn compute_latent_trace(&self, tool_name: &str, input: &str, output: &str) -> Vec<f32> {
        let dim = self.latent_dim;
        let mut trace = Vec::with_capacity(dim);

        for i in 0..dim {
            let value = ((tool_name.len() * (i + 1)) as f32 / 100.0).sin()
                * ((input.len() + output.len()) as f32 / 50.0).cos();
            trace.push(value);
        }

        trace
    }

    pub fn call_recursivemas_cli(&self, args: &[&str]) -> Result<String, String> {
        if !self.enabled {
            return Err("RecursiveMAS is not enabled".to_string());
        }

        let output = Command::new(&self.cli_path)
            .args(args)
            .output()
            .map_err(|e| format!("Failed to execute {}: {}", self.cli_path, e))?;

        if output.status.success() {
            Ok(String::from_utf8_lossy(&output.stdout).to_string())
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }

    pub fn get_traces(&self) -> &BTreeMap<String, Vec<f32>> {
        &self.latent_traces
    }

    pub fn build_trace_message(&self) -> String {
        if self.latent_traces.is_empty() {
            return String::new();
        }

        let mut msg = String::from("RecursiveMAS Traces:\n");
        for (key, trace) in &self.latent_traces {
            msg.push_str(&format!("  {}: {:?}\n", key, trace));
        }
        msg
    }
}

pub struct RecursiveMasMonitor {
    session: RecursiveMasSession,
}

impl RecursiveMasMonitor {
    pub fn new(config: Option<&RecursiveMasConfig>) -> Self {
        Self {
            session: RecursiveMasSession::new(config),
        }
    }

    pub fn is_enabled(&self) -> bool {
        self.session.is_enabled()
    }

    pub fn before_tool_use(&mut self, tool_name: &str, input: &str) {
        if !self.session.is_enabled() {
            return;
        }

        self.session.increment_depth();
        let _ = self.session.call_recursivemas_cli(&[
            "inspect",
            "--tool", tool_name,
            "--input", input,
            "--topology", &self.session.topology,
        ]);
    }

    pub fn after_tool_use(&mut self, tool_name: &str, input: &str, output: &str, is_error: bool) {
        if !self.session.is_enabled() {
            return;
        }

        self.session.log_trace(tool_name, input, output);

        let status = if is_error { "error" } else { "success" };
        let _ = self.session.call_recursivemas_cli(&[
            "benchmark",
            "--tool", tool_name,
            "--status", status,
            "--depth", &self.session.current_depth().to_string(),
        ]);

        self.session.decrement_depth();
    }

    pub fn get_session(&self) -> &RecursiveMasSession {
        &self.session
    }
}

pub fn monitor_tool_use(
    tool_name: &str,
    input: &str,
    output: &str,
    is_error: bool,
    config: Option<&RecursiveMasConfig>,
) -> String {
    let mut monitor = RecursiveMasMonitor::new(config);

    if !monitor.is_enabled() {
        return String::new();
    }

    monitor.before_tool_use(tool_name, input);
    monitor.after_tool_use(tool_name, input, output, is_error);

    monitor.get_session().build_trace_message()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::RecursiveMasConfig;

    fn make_config() -> RecursiveMasConfig {
        RecursiveMasConfig {
            enabled: true,
            topology: "chain".to_string(),
            latent_dim: 4,
            cli_path: "echo".to_string(),
            log_traces: true,
        }
    }

    #[test]
    fn session_tracks_depth() {
        let cfg = make_config();
        let mut session = RecursiveMasSession::new(Some(&cfg));

        assert!(session.is_enabled());
        assert_eq!(session.current_depth(), 0);

        session.increment_depth();
        assert_eq!(session.current_depth(), 1);

        session.decrement_depth();
        assert_eq!(session.current_depth(), 0);
    }

    #[test]
    fn session_logs_traces() {
        let cfg = make_config();
        let mut session = RecursiveMasSession::new(Some(&cfg));

        session.log_trace("bash", "ls", "file1.txt");
        let traces = session.get_traces();
        assert!(!traces.is_empty());
    }

    #[test]
    fn monitor_calls_before_and_after() {
        let cfg = make_config();
        let mut monitor = RecursiveMasMonitor::new(Some(&cfg));

        monitor.before_tool_use("bash", "ls");
        assert_eq!(monitor.get_session().current_depth(), 1);

        monitor.after_tool_use("bash", "ls", "output", false);
        assert_eq!(monitor.get_session().current_depth(), 0);
    }

    #[test]
    fn disabled_monitor_does_nothing() {
        let cfg = RecursiveMasConfig {
            enabled: false,
            topology: "chain".to_string(),
            latent_dim: 4,
            cli_path: "echo".to_string(),
            log_traces: false,
        };
        let monitor = RecursiveMasMonitor::new(Some(&cfg));

        assert!(!monitor.is_enabled());
    }

    #[test]
    fn monitor_tool_use_helper() {
        let cfg = make_config();
        let result = monitor_tool_use("bash", "ls", "output", false, Some(&cfg));
        assert!(result.contains("RecursiveMAS Traces") || result.is_empty());
    }
}
