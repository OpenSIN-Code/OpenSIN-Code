#!/usr/bin/env python3
"""
DEEP Hermes+Claude-to-OpenSIN Comparator
Deep scans sin-hermes-agent AND sin-claude repos, extracts EVERY feature,
compares with OpenSIN repos, and creates issues for everything missing.

Usage:
    python deep_comparator.py --repo OpenSIN-AI/OpenSIN --needed 50 \
        --hermes-dir hermes --claude-dir sin-claude --target-dir target-repo
"""

import os
import sys
import re
import json
import subprocess
import logging
import time
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Set, Tuple, Optional
from dataclasses import dataclass, field

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@dataclass
class MissingFeature:
    title: str
    body: str
    recommendation: str
    labels: List[str]
    category: str
    source: str = ""  # "hermes" or "claude"
    source_path: str = ""
    source_content: str = ""
    severity: str = "MEDIUM"


def deep_scan_directory(base_path: str) -> Dict:
    """DEEP scan of a directory - reads EVERY file and extracts features"""
    result = {
        "tools": [],
        "commands": [],
        "api_endpoints": [],
        "components": [],
        "services": [],
        "workflows": [],
        "tests": [],
        "config_patterns": [],
        "security_features": [],
        "integrations": [],
        "cli_features": [],
        "ui_features": [],
        "auth_features": [],
        "ai_features": [],
        "devops_features": [],
        "data_features": [],
        "file_count": 0,
        "total_lines": 0,
        "directories": [],
        "all_files": [],
    }

    if not os.path.exists(base_path):
        logger.warning(f"Path not found: {base_path}")
        return result

    for root, dirs, files in os.walk(base_path):
        # Skip hidden dirs EXCEPT .github, .claude, .config
        dirs[:] = [
            d
            for d in dirs
            if d
            not in [
                "node_modules",
                "__pycache__",
                "venv",
                ".venv",
                "dist",
                "build",
                ".git",
                "target",
                "out",
                "coverage",
            ]
        ]

        rel_root = os.path.relpath(root, base_path)
        if rel_root != ".":
            result["directories"].append(rel_root)

        for file in files:
            filepath = os.path.join(root, file)
            rel_path = os.path.relpath(filepath, base_path)
            result["all_files"].append(rel_path)

            ext = os.path.splitext(file)[1]
            if ext not in (
                ".py",
                ".ts",
                ".js",
                ".tsx",
                ".jsx",
                ".json",
                ".yml",
                ".yaml",
                ".toml",
                ".md",
                ".rs",
                ".css",
            ):
                continue

            result["file_count"] += 1

            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    lines = content.split("\n")
                    result["total_lines"] += len(lines)
            except:
                continue

            # Extract features based on directory
            if "/tools/" in rel_path or "\\tools\\" in rel_path:
                tool_name = os.path.splitext(file)[0]
                if not tool_name.startswith(
                    ("index", "test", "spec", "constants", "prompt", "utils", "types")
                ):
                    # Check if this is a tool definition file
                    if "Tool" in rel_path or "tool" in rel_path:
                        # Extract tool description from content
                        desc_match = re.search(
                            r'(?:description|name)\s*[:=]\s*["\']([^"\']+)["\']',
                            content,
                        )
                        desc = desc_match.group(1) if desc_match else tool_name

                        result["tools"].append(
                            {
                                "name": tool_name,
                                "path": rel_path,
                                "description": desc,
                                "has_prompt": "prompt" in content.lower(),
                                "has_validation": "validat" in content.lower(),
                                "has_permissions": "permission" in content.lower()
                                or "allow" in content.lower(),
                                "has_security": "secur" in content.lower()
                                or "sandbox" in content.lower(),
                                "lines": len(lines),
                            }
                        )

            # Extract commands
            if "/commands/" in rel_path or "/cmd/" in rel_path:
                cmd_name = os.path.splitext(file)[0]
                if not cmd_name.startswith(("index", "test", "spec", "utils")):
                    result["commands"].append(
                        {"name": cmd_name, "path": rel_path, "lines": len(lines)}
                    )

            # Extract API endpoints
            if "/api/" in rel_path.lower():
                if file in (
                    "route.ts",
                    "route.js",
                    "route.py",
                    "handler.ts",
                    "handler.py",
                ):
                    api_path = (
                        rel_path.replace("/route.ts", "")
                        .replace("/route.js", "")
                        .replace("/route.py", "")
                    )
                    result["api_endpoints"].append(
                        {"path": api_path, "file": rel_path, "lines": len(lines)}
                    )

            # Extract components
            if ext in (".tsx", ".jsx", ".vue"):
                comp_name = os.path.splitext(file)[0]
                if not comp_name.startswith(("index", "test", "spec")):
                    result["components"].append(
                        {"name": comp_name, "path": rel_path, "lines": len(lines)}
                    )

            # Extract workflows
            if "workflow" in rel_path.lower() or "n8n" in rel_path.lower():
                if ext == ".json":
                    try:
                        wf_data = json.loads(content)
                        result["workflows"].append(
                            {
                                "name": wf_data.get("name", file),
                                "path": rel_path,
                                "description": wf_data.get("description", ""),
                            }
                        )
                    except:
                        result["workflows"].append({"name": file, "path": rel_path})

            # Extract tests
            if "test" in rel_path.lower() or "spec" in rel_path.lower():
                if ext in (".ts", ".js", ".py", ".rs"):
                    test_name = (
                        file.replace(".spec.", ".")
                        .replace(".test.", ".")
                        .replace("_test.", ".")
                    )
                    result["tests"].append(
                        {
                            "name": os.path.splitext(test_name)[0],
                            "path": rel_path,
                            "lines": len(lines),
                        }
                    )

            # Extract integrations from content
            integrations_found = []
            for integration in [
                "stripe",
                "supabase",
                "redis",
                "postgres",
                "mongodb",
                "firebase",
                "aws",
                "gcp",
                "azure",
                "docker",
                "kubernetes",
                "terraform",
                "github",
                "gitlab",
                "slack",
                "discord",
                "telegram",
                "webhook",
                "oauth",
                "jwt",
                "saml",
                "ldap",
                "mcp",
                "lsp",
                "graphql",
                "websocket",
                "grpc",
                "rabbitmq",
                "kafka",
                "elasticsearch",
            ]:
                if integration in content.lower():
                    integrations_found.append(integration)

            if integrations_found:
                result["integrations"].append(
                    {"path": rel_path, "integrations": integrations_found}
                )

            # Extract security features
            security_features = []
            for sec in [
                "sandbox",
                "rate.limit",
                "csrf",
                "cors",
                "xss",
                "injection",
                "encryption",
                "hash",
                "token",
                "auth",
                "permission",
                "validation",
                "sanitize",
                "escape",
                "csp",
                "hsts",
                "https",
                "secret",
            ]:
                if re.search(
                    r"\b" + sec.replace(".", r"\.") + r"\b", content, re.IGNORECASE
                ):
                    security_features.append(sec)

            if security_features:
                result["security_features"].append(
                    {"path": rel_path, "features": security_features}
                )

            # Extract AI/ML features
            ai_features = []
            for ai in [
                "llm",
                "model",
                "embedding",
                "vector",
                "chat",
                "completion",
                "prompt",
                "agent",
                "tool_call",
                "function_call",
                "stream",
                "token",
                "context_window",
                "temperature",
                "top_p",
            ]:
                if re.search(r"\b" + ai + r"\b", content, re.IGNORECASE):
                    ai_features.append(ai)

            if ai_features:
                result["ai_features"].append(
                    {"path": rel_path, "features": ai_features}
                )

    # Deduplicate
    result["tools"] = list({t["name"]: t for t in result["tools"]}.values())
    result["commands"] = list({c["name"]: c for c in result["commands"]}.values())
    result["components"] = list({c["name"]: c for c in result["components"]}.values())

    return result


def scan_for_security_issues_deep(path: str, repo_name: str) -> List[Dict]:
    """DEEP security scan - reads EVERY file"""
    issues = []

    security_patterns = {
        "eval": (
            r"\beval\s*\(",
            "CRITICAL",
            "eval() Usage - RCE Risk",
            "Replace with json.loads() or ast.literal_eval()",
        ),
        "exec": (
            r"\bexec\s*\(",
            "CRITICAL",
            "exec() Usage - Code Injection",
            "Use subprocess with shell=False",
        ),
        "shell_true": (
            r"shell\s*=\s*True",
            "HIGH",
            "shell=True Command Injection",
            "Use shell=False with list args",
        ),
        "sql_inject": (
            r'f["\'].*(?:SELECT|INSERT|UPDATE|DELETE).*\{',
            "CRITICAL",
            "SQL Injection via f-string",
            "Use parameterized queries",
        ),
        "hardcoded_secret": (
            r'(?:password|secret|token|api_key|apikey|private_key)\s*=\s*["\'][^"\']{8,}["\']',
            "CRITICAL",
            "Hardcoded Secret",
            "Use env vars or secrets manager",
        ),
        "hardcoded_ip": (
            r"\b(?:92\.5\.60\.87|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+)\b",
            "HIGH",
            "Hardcoded IP Address",
            "Use environment variables",
        ),
        "cors_wildcard": (
            r'allow_origins\s*=\s*\["\*"\]',
            "HIGH",
            "CORS Wildcard",
            "Specify origins explicitly",
        ),
        "jwt_weak": (
            r'(?:jwt_secret|secret_key)\s*=\s*["\'](?:secret|dev|test|1234)',
            "CRITICAL",
            "Weak JWT Secret",
            "Use strong random secret",
        ),
        "debug_true": (
            r"debug\s*=\s*True",
            "HIGH",
            "Debug Mode Enabled",
            "Set debug=False in production",
        ),
        "bare_except": (
            r"except\s*:",
            "MEDIUM",
            "Bare Except Clause",
            "Use except Exception: minimum",
        ),
        "pass_except": (
            r"except.*:\s*\n\s*pass",
            "HIGH",
            "Swallowed Exception",
            "Log the error at minimum",
        ),
        "print_logging": (
            r"\bprint\s*\(",
            "LOW",
            "print() Instead of Logger",
            "Use proper logging module",
        ),
        "no_timeout": (
            r"(?:requests\.get|httpx\.get|urllib)",
            "MEDIUM",
            "No Timeout on HTTP Request",
            "Add timeout parameter",
        ),
        "insecure_random": (
            r"\brandom\.(?:random|choice|randint)",
            "MEDIUM",
            "Insecure Random",
            "Use secrets module",
        ),
    }

    if not os.path.exists(path):
        return issues

    for root, dirs, files in os.walk(path):
        dirs[:] = [
            d
            for d in dirs
            if d
            not in [
                "node_modules",
                "__pycache__",
                "venv",
                ".venv",
                "dist",
                "build",
                ".git",
            ]
        ]

        for file in files:
            if not file.endswith(
                (".py", ".ts", ".js", ".json", ".yml", ".yaml", ".toml")
            ):
                continue

            filepath = os.path.join(root, file)
            rel_path = os.path.relpath(filepath, path)

            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except:
                continue

            for pattern_name, (
                pattern,
                severity,
                title,
                recommendation,
            ) in security_patterns.items():
                try:
                    matches = list(
                        re.finditer(pattern, content, re.IGNORECASE | re.MULTILINE)
                    )
                except re.error:
                    continue

                if matches and len(matches) <= 5:  # Individual issues
                    for match in matches[:1]:
                        line_num = content[: match.start()].count("\n") + 1
                        issues.append(
                            {
                                "title": f"[SECURITY] [{severity}] {title} in {rel_path}:{line_num}",
                                "body": f"Found {len(matches)} occurrence(s) of {pattern_name} pattern.\n\nThis is a security vulnerability that needs immediate attention.",
                                "recommendation": recommendation,
                                "labels": [
                                    "security",
                                    "bug",
                                    f"priority:{severity.lower()}",
                                ],
                                "file_path": rel_path,
                                "severity": severity,
                            }
                        )
                elif matches and len(matches) > 5:  # Summary issue
                    issues.append(
                        {
                            "title": f"[SECURITY] [{severity}] {title} ({len(matches)} occurrences in {rel_path})",
                            "body": f"Found {len(matches)} occurrences of {pattern_name} pattern in this file.",
                            "recommendation": recommendation,
                            "labels": [
                                "security",
                                "bug",
                                f"priority:{severity.lower()}",
                            ],
                            "file_path": rel_path,
                            "severity": severity,
                        }
                    )

    return issues


def compare_features(
    hermes_data: Dict, claude_data: Dict, opensin_data: Dict, repo_name: str
) -> List[MissingFeature]:
    """Compare Hermes + Claude features against OpenSIN"""
    issues = []

    # 1. Compare TOOLS
    hermes_tools = {t["name"].lower(): t for t in hermes_data.get("tools", [])}
    claude_tools = {t["name"].lower(): t for t in claude_data.get("tools", [])}
    opensin_tools = {t["name"].lower(): t for t in opensin_data.get("tools", [])}

    # Tools in Claude but not in OpenSIN
    for tool_name, tool_info in claude_tools.items():
        if tool_name not in opensin_tools:
            issues.append(
                MissingFeature(
                    title=f"[FEATURE] 🔴 Missing Tool: {tool_info['name']} (from Claude Code)",
                    body=f"Claude Code has the '{tool_info['name']}' tool ({tool_info.get('lines', '?')} lines) that is missing in {repo_name}.\n\nPath: `{tool_info['path']}`\nDescription: {tool_info.get('description', tool_info['name'])}",
                    recommendation=f"Implement the '{tool_info['name']}' tool to match Claude Code functionality.",
                    labels=["feature", "claude-code", "enhancement"],
                    category="feature",
                    source="claude",
                    source_path=tool_info["path"],
                    severity="HIGH",
                )
            )

    # Tools in Hermes but not in OpenSIN
    for tool_name, tool_info in hermes_tools.items():
        if tool_name not in opensin_tools:
            issues.append(
                MissingFeature(
                    title=f"[FEATURE] 🔴 Missing Tool: {tool_info['name']} (from Hermes Agent)",
                    body=f"Hermes Agent has the '{tool_info['name']}' tool that is missing in {repo_name}.\n\nPath: `{tool_info['path']}`",
                    recommendation=f"Implement the '{tool_info['name']}' tool to match Hermes functionality.",
                    labels=["feature", "hermes", "enhancement"],
                    category="feature",
                    source="hermes",
                    source_path=tool_info["path"],
                    severity="HIGH",
                )
            )

    # 2. Compare COMMANDS
    hermes_cmds = {c["name"].lower(): c for c in hermes_data.get("commands", [])}
    claude_cmds = {c["name"].lower(): c for c in claude_data.get("commands", [])}
    opensin_cmds = {c["name"].lower(): c for c in opensin_data.get("commands", [])}

    for cmd_name, cmd_info in claude_cmds.items():
        if cmd_name not in opensin_cmds:
            issues.append(
                MissingFeature(
                    title=f"[FEATURE] 🔴 Missing CLI Command: {cmd_info['name']} (from Claude Code)",
                    body=f"Claude Code has CLI command '{cmd_info['name']}' ({cmd_info.get('lines', '?')} lines) missing in {repo_name}.",
                    recommendation=f"Implement CLI command '{cmd_info['name']}'.",
                    labels=["feature", "cli", "enhancement"],
                    category="feature",
                    source="claude",
                    source_path=cmd_info["path"],
                    severity="MEDIUM",
                )
            )

    # 3. Compare COMPONENTS
    hermes_comps = {c["name"].lower(): c for c in hermes_data.get("components", [])}
    opensin_comps = {c["name"].lower(): c for c in opensin_data.get("components", [])}

    for comp_name, comp_info in hermes_comps.items():
        if comp_name not in opensin_comps:
            issues.append(
                MissingFeature(
                    title=f"[FEATURE] 🔴 Missing UI Component: {comp_info['name']} (from Hermes)",
                    body=f"Hermes has UI component '{comp_info['name']}' ({comp_info.get('lines', '?')} lines) missing in {repo_name}.",
                    recommendation=f"Implement UI component '{comp_info['name']}'.",
                    labels=["feature", "ui", "enhancement"],
                    category="feature",
                    source="hermes",
                    source_path=comp_info["path"],
                    severity="LOW",
                )
            )

    # 4. Compare API ENDPOINTS
    hermes_apis = {a["path"].lower(): a for a in hermes_data.get("api_endpoints", [])}
    opensin_apis = {a["path"].lower(): a for a in opensin_data.get("api_endpoints", [])}

    for api_path, api_info in hermes_apis.items():
        if api_path not in opensin_apis:
            issues.append(
                MissingFeature(
                    title=f"[FEATURE] 🔴 Missing API Endpoint: {api_info['path']} (from Hermes)",
                    body=f"Hermes has API endpoint '{api_info['path']}' missing in {repo_name}.",
                    recommendation=f"Implement API endpoint '{api_info['path']}'.",
                    labels=["feature", "api", "enhancement"],
                    category="feature",
                    source="hermes",
                    source_path=api_info["file"],
                    severity="MEDIUM",
                )
            )

    # 5. Compare WORKFLOWS
    hermes_wfs = {w["name"].lower(): w for w in hermes_data.get("workflows", [])}
    opensin_wfs = {w["name"].lower(): w for w in opensin_data.get("workflows", [])}

    for wf_name, wf_info in hermes_wfs.items():
        if wf_name not in opensin_wfs:
            issues.append(
                MissingFeature(
                    title=f"[FEATURE] 🔴 Missing n8n Workflow: {wf_info['name']} (from Hermes)",
                    body=f"Hermes has n8n workflow '{wf_info['name']}' missing in {repo_name}.\n\nDescription: {wf_info.get('description', 'N/A')}",
                    recommendation=f"Implement n8n workflow '{wf_info['name']}'.",
                    labels=["feature", "n8n", "enhancement"],
                    category="feature",
                    source="hermes",
                    source_path=wf_info["path"],
                    severity="HIGH",
                )
            )

    # 6. Compare INTEGRATIONS
    hermes_integrations = set()
    for item in hermes_data.get("integrations", []):
        hermes_integrations.update(item.get("integrations", []))

    claude_integrations = set()
    for item in claude_data.get("integrations", []):
        claude_integrations.update(item.get("integrations", []))

    opensin_integrations = set()
    for item in opensin_data.get("integrations", []):
        opensin_integrations.update(item.get("integrations", []))

    for integration in (
        hermes_integrations | claude_integrations
    ) - opensin_integrations:
        source = "hermes" if integration in hermes_integrations else "claude"
        issues.append(
            MissingFeature(
                title=f"[FEATURE] 🔴 Missing Integration: {integration.upper()} (from {source.title()})",
                body=f"{source.title()} has {integration.upper()} integration that is missing in {repo_name}.",
                recommendation=f"Implement {integration.upper()} integration.",
                labels=["feature", "integration", "enhancement"],
                category="feature",
                source=source,
                severity="HIGH",
            )
        )

    # 7. Compare AI FEATURES
    hermes_ai = set()
    for item in hermes_data.get("ai_features", []):
        hermes_ai.update(item.get("features", []))

    claude_ai = set()
    for item in claude_data.get("ai_features", []):
        claude_ai.update(item.get("features", []))

    opensin_ai = set()
    for item in opensin_data.get("ai_features", []):
        opensin_ai.update(item.get("features", []))

    for ai_feat in claude_ai - opensin_ai:
        issues.append(
            MissingFeature(
                title=f"[AI] 🔴 Missing AI Feature: {ai_feat} (from Claude Code)",
                body=f"Claude Code has AI feature '{ai_feat}' missing in {repo_name}.",
                recommendation=f"Implement AI feature '{ai_feat}'.",
                labels=["feature", "ai", "enhancement"],
                category="feature",
                source="claude",
                severity="HIGH",
            )
        )

    # 8. Compare TESTS
    hermes_tests = {t["name"].lower(): t for t in hermes_data.get("tests", [])}
    claude_tests = {t["name"].lower(): t for t in claude_data.get("tests", [])}
    opensin_tests = {t["name"].lower(): t for t in opensin_data.get("tests", [])}

    for test_name, test_info in claude_tests.items():
        if test_name not in opensin_tests:
            issues.append(
                MissingFeature(
                    title=f"[TESTING] 🔴 Missing Test: {test_info['name']} (from Claude Code)",
                    body=f"Claude Code has test '{test_info['name']}' ({test_info.get('lines', '?')} lines) missing in {repo_name}.",
                    recommendation=f"Implement test '{test_info['name']}'.",
                    labels=["testing", "enhancement"],
                    category="testing",
                    source="claude",
                    source_path=test_info["path"],
                    severity="MEDIUM",
                )
            )

    # Sort by severity
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    issues.sort(key=lambda x: severity_order.get(x.severity, 4))

    return issues


def check_existing_issues(repo: str) -> Set[str]:
    try:
        result = subprocess.run(
            [
                "gh",
                "issue",
                "list",
                "--repo",
                repo,
                "--state",
                "open",
                "--limit",
                "1000",
                "--json",
                "title",
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0:
            return {i["title"] for i in json.loads(result.stdout)}
    except Exception as e:
        logger.warning(f"Could not fetch existing issues: {e}")
    return set()


def create_issue(repo: str, title: str, body: str, labels: List[str]) -> Optional[str]:
    try:
        result = subprocess.run(
            [
                "gh",
                "issue",
                "create",
                "--repo",
                repo,
                "--title",
                title,
                "--body",
                body,
                "--label",
                ",".join(labels[:3]),
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        return result.stdout.strip() if result.returncode == 0 else None
    except:
        return None


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="DEEP Hermes+Claude-to-OpenSIN Comparator"
    )
    parser.add_argument("--repo", required=True)
    parser.add_argument("--needed", type=int, default=50)
    parser.add_argument("--force", type=str, default="false")
    parser.add_argument("--hermes-dir", required=True)
    parser.add_argument("--claude-dir", required=True)
    parser.add_argument("--target-dir", required=True)
    args = parser.parse_args()

    repo_name = args.repo.split("/")[-1]

    # DEEP SCAN all three repos
    logger.info("=" * 80)
    logger.info("DEEP SCANNING sin-hermes-agent...")
    hermes_data = deep_scan_directory(args.hermes_dir)
    logger.info(
        f"  Files: {hermes_data['file_count']}, Lines: {hermes_data['total_lines']}"
    )
    logger.info(
        f"  Tools: {len(hermes_data['tools'])}, Commands: {len(hermes_data['commands'])}"
    )
    logger.info(
        f"  Components: {len(hermes_data['components'])}, APIs: {len(hermes_data['api_endpoints'])}"
    )
    logger.info(
        f"  Workflows: {len(hermes_data['workflows'])}, Tests: {len(hermes_data['tests'])}"
    )

    logger.info("DEEP SCANNING sin-claude...")
    claude_data = deep_scan_directory(args.claude_dir)
    logger.info(
        f"  Files: {claude_data['file_count']}, Lines: {claude_data['total_lines']}"
    )
    logger.info(
        f"  Tools: {len(claude_data['tools'])}, Commands: {len(claude_data['commands'])}"
    )
    logger.info(
        f"  Components: {len(claude_data['components'])}, APIs: {len(claude_data['api_endpoints'])}"
    )
    logger.info(
        f"  Workflows: {len(claude_data['workflows'])}, Tests: {len(claude_data['tests'])}"
    )

    logger.info(f"DEEP SCANNING {repo_name}...")
    opensin_data = deep_scan_directory(args.target_dir)
    logger.info(
        f"  Files: {opensin_data['file_count']}, Lines: {opensin_data['total_lines']}"
    )
    logger.info(
        f"  Tools: {len(opensin_data['tools'])}, Commands: {len(opensin_data['commands'])}"
    )
    logger.info(
        f"  Components: {len(opensin_data['components'])}, APIs: {len(opensin_data['api_endpoints'])}"
    )

    # Compare
    logger.info("COMPARING features...")
    missing = compare_features(hermes_data, claude_data, opensin_data, repo_name)
    logger.info(f"Missing features found: {len(missing)}")

    # Security scan
    logger.info("DEEP SECURITY SCANNING...")
    security_issues = []
    security_issues.extend(scan_for_security_issues_deep(args.hermes_dir, "hermes"))
    security_issues.extend(scan_for_security_issues_deep(args.claude_dir, "claude"))
    security_issues.extend(scan_for_security_issues_deep(args.target_dir, repo_name))
    logger.info(f"Security issues found: {len(security_issues)}")

    # Combine
    all_issues = []
    for feat in missing:
        body = f"""## Problem
{feat.body}

## Source
- **Repository:** {feat.source}
- **File:** `{feat.source_path}`

## Recommendation
{feat.recommendation}

---
*Auto-generated by DEEP Hermes+Claude Comparator on {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}*
"""
        all_issues.append(
            {
                "title": feat.title,
                "body": body,
                "labels": feat.labels,
                "severity": feat.severity,
            }
        )

    for sec in security_issues:
        body = f"""## Problem
{sec["body"]}

## Location
- **File:** `{sec["file_path"]}`

## Recommendation
{sec["recommendation"]}

---
*Auto-generated by DEEP Security Scanner on {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}*
"""
        all_issues.append(
            {
                "title": sec["title"],
                "body": body,
                "labels": sec["labels"],
                "severity": sec["severity"],
            }
        )

    # Deduplicate
    existing = check_existing_issues(args.repo)
    new_issues = [i for i in all_issues if i["title"] not in existing]

    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    new_issues.sort(key=lambda x: severity_order.get(x.get("severity", "MEDIUM"), 4))

    issues_to_create = new_issues[: args.needed]
    logger.info(f"Will create {len(issues_to_create)} issues")

    # Create
    created = 0
    results = []
    for i, issue in enumerate(issues_to_create):
        logger.info(f"[{i + 1}/{len(issues_to_create)}] {issue['title'][:80]}...")
        url = create_issue(args.repo, issue["title"], issue["body"], issue["labels"])
        if url:
            created += 1
            results.append({"title": issue["title"], "url": url})
            logger.info(f"  ✓ Created")
        else:
            logger.warning(f"  ✗ Failed")
        if i < len(issues_to_create) - 1:
            time.sleep(2)

    # Save
    with open("deep_comparator_results.json", "w") as f:
        json.dump(
            {
                "timestamp": datetime.now().isoformat(),
                "repo": args.repo,
                "hermes": {
                    "files": hermes_data["file_count"],
                    "lines": hermes_data["total_lines"],
                    "tools": len(hermes_data["tools"]),
                },
                "claude": {
                    "files": claude_data["file_count"],
                    "lines": claude_data["total_lines"],
                    "tools": len(claude_data["tools"]),
                },
                "opensin": {
                    "files": opensin_data["file_count"],
                    "lines": opensin_data["total_lines"],
                    "tools": len(opensin_data["tools"]),
                },
                "missing_features": len(missing),
                "security_issues": len(security_issues),
                "created": created,
                "results": results,
            },
            f,
            indent=2,
        )

    logger.info(f"\n{'=' * 80}")
    logger.info(f"Done! Created {created}/{args.needed} issues")
    logger.info(f"{'=' * 80}")


if __name__ == "__main__":
    main()
