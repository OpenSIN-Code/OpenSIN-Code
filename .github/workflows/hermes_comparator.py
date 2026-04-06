#!/usr/bin/env python3
"""
Hermes-to-OpenSIN Comparator
Compares sin-hermes-agent with OpenSIN repos and creates issues for missing features.

Usage:
    python hermes_comparator.py --repo OpenSIN-AI/OpenSIN --needed 50 --hermes-dir hermes --target-dir target-repo
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
    """Represents a feature found in Hermes but missing in OpenSIN"""

    title: str
    body: str
    recommendation: str
    labels: List[str]
    category: str
    hermes_path: str = ""
    hermes_content: str = ""
    severity: str = "MEDIUM"


@dataclass
class SecurityIssue:
    """Represents a security issue found in Hermes or OpenSIN"""

    title: str
    body: str
    recommendation: str
    labels: List[str]
    file_path: str = ""
    severity: str = "MEDIUM"


def scan_directory_structure(base_path: str) -> Dict[str, List[str]]:
    """Scan directory structure and categorize files"""
    structure = {
        "src": [],
        "api": [],
        "components": [],
        "workflows": [],
        "tests": [],
        "config": [],
        "scripts": [],
        "docs": [],
        "other": [],
    }

    for root, dirs, files in os.walk(base_path):
        dirs[:] = [
            d
            for d in dirs
            if not d.startswith(".")
            and d
            not in ["node_modules", "__pycache__", "venv", ".venv", "dist", "build"]
        ]

        rel_root = os.path.relpath(root, base_path)

        for file in files:
            rel_path = os.path.join(rel_root, file)

            if rel_path.startswith("src/"):
                structure["src"].append(rel_path)
            elif (
                rel_path.startswith("n8n-workflows/") or "workflow" in rel_path.lower()
            ):
                structure["workflows"].append(rel_path)
            elif rel_path.startswith("tests/"):
                structure["tests"].append(rel_path)
            elif file.endswith((".json", ".yml", ".yaml", ".toml", ".env")):
                structure["config"].append(rel_path)
            elif file.endswith((".sh", ".py")) and "script" in rel_path.lower():
                structure["scripts"].append(rel_path)
            elif rel_path.startswith("src/app/api/"):
                structure["api"].append(rel_path)
            elif rel_path.startswith("src/components/"):
                structure["components"].append(rel_path)
            else:
                structure["other"].append(rel_path)

    return structure


def extract_features_from_hermes(hermes_path: str) -> Dict[str, List[Dict]]:
    """Extract features/capabilities from Hermes agent"""
    features = {
        "ecommerce": [],
        "ai_chat": [],
        "payment": [],
        "automation": [],
        "testing": [],
        "devops": [],
        "security": [],
        "ui_components": [],
        "api_endpoints": [],
        "n8n_workflows": [],
        "biometrics": [],
        "auth_rotator": [],
        "other": [],
    }

    # Scan n8n workflows
    workflows_dir = os.path.join(hermes_path, "n8n-workflows")
    if os.path.exists(workflows_dir):
        for wf_file in os.listdir(workflows_dir):
            if wf_file.endswith(".json"):
                try:
                    with open(os.path.join(workflows_dir, wf_file)) as f:
                        wf_data = json.load(f)
                        wf_name = wf_data.get("name", wf_file)
                        features["n8n_workflows"].append(
                            {
                                "name": wf_name,
                                "file": wf_file,
                                "description": wf_data.get("description", ""),
                            }
                        )
                except:
                    features["n8n_workflows"].append({"name": wf_file, "file": wf_file})

    # Scan API routes
    api_dir = os.path.join(hermes_path, "src", "app", "api")
    if os.path.exists(api_dir):
        for root, dirs, files in os.walk(api_dir):
            for f in files:
                if f == "route.ts" or f == "route.js":
                    rel_path = os.path.relpath(os.path.join(root, f), hermes_path)
                    api_path = (
                        rel_path.replace("/route.ts", "")
                        .replace("/route.js", "")
                        .replace("src/app", "")
                    )
                    features["api_endpoints"].append(
                        {"path": api_path, "file": rel_path}
                    )

    # Scan UI components
    components_dir = os.path.join(hermes_path, "src", "components")
    if os.path.exists(components_dir):
        for root, dirs, files in os.walk(components_dir):
            for f in files:
                if f.endswith((".tsx", ".ts")):
                    rel_path = os.path.relpath(os.path.join(root, f), hermes_path)
                    comp_name = os.path.splitext(f)[0]
                    features["ui_components"].append(
                        {"name": comp_name, "file": rel_path}
                    )

    # Scan tests
    tests_dir = os.path.join(hermes_path, "tests")
    if os.path.exists(tests_dir):
        for root, dirs, files in os.walk(tests_dir):
            for f in files:
                if f.endswith((".spec.ts", ".test.ts", ".spec.js", ".test.js")):
                    rel_path = os.path.relpath(os.path.join(root, f), hermes_path)
                    test_name = (
                        f.replace(".spec.ts", "")
                        .replace(".test.ts", "")
                        .replace(".spec.js", "")
                        .replace(".test.js", "")
                    )
                    features["testing"].append({"name": test_name, "file": rel_path})

    # Scan auth rotator
    auth_dir = os.path.join(hermes_path, ".open-auth-rotator")
    if os.path.exists(auth_dir):
        for root, dirs, files in os.walk(auth_dir):
            for f in files:
                if f.endswith(".py"):
                    rel_path = os.path.relpath(os.path.join(root, f), hermes_path)
                    features["auth_rotator"].append(
                        {"name": f.replace(".py", ""), "file": rel_path}
                    )

    # Scan Supabase functions
    supabase_dir = os.path.join(
        hermes_path, "dev", "ai-autonomous-webshop", "supabase", "functions"
    )
    if os.path.exists(supabase_dir):
        for func_dir in os.listdir(supabase_dir):
            func_path = os.path.join(supabase_dir, func_dir, "index.ts")
            if os.path.exists(func_path):
                features["api_endpoints"].append(
                    {
                        "path": f"/functions/{func_dir}",
                        "file": os.path.relpath(func_path, hermes_path),
                    }
                )

    # Scan payment/webhook integrations
    for root, dirs, files in os.walk(hermes_path):
        for f in files:
            if f.endswith((".ts", ".js", ".py")):
                filepath = os.path.join(root, f)
                try:
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as file:
                        content = file.read()
                        rel_path = os.path.relpath(filepath, hermes_path)

                        if "stripe" in content.lower() and "webhook" in content.lower():
                            features["payment"].append(
                                {"name": "Stripe Webhook Integration", "file": rel_path}
                            )

                        if "supabase" in content.lower():
                            features["other"].append(
                                {"name": "Supabase Integration", "file": rel_path}
                            )

                        if "ai" in content.lower() and "chat" in content.lower():
                            features["ai_chat"].append(
                                {"name": "AI Chat Integration", "file": rel_path}
                            )
                except:
                    pass

    return features


def scan_opensin_features(target_path: str) -> Dict[str, Set[str]]:
    """Scan OpenSIN repo for existing features"""
    existing = {
        "api_endpoints": set(),
        "components": set(),
        "workflows": set(),
        "tests": set(),
        "features": set(),
        "tools": set(),
        "integrations": set(),
    }

    for root, dirs, files in os.walk(target_path):
        dirs[:] = [
            d
            for d in dirs
            if not d.startswith(".")
            and d
            not in ["node_modules", "__pycache__", "venv", ".venv", "dist", "build"]
        ]

        for f in files:
            filepath = os.path.join(root, f)
            rel_path = os.path.relpath(filepath, target_path)

            # Detect API routes
            if "api" in rel_path.lower() and f.endswith((".py", ".ts", ".js")):
                existing["api_endpoints"].add(rel_path)

            # Detect components
            if f.endswith((".tsx", ".jsx", ".vue")):
                existing["components"].add(
                    f.replace(".tsx", "").replace(".jsx", "").replace(".vue", "")
                )

            # Detect tests
            if f.endswith((".test.", ".spec.", "test_", "_test.")):
                existing["tests"].add(rel_path)

            # Detect features from content
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as file:
                    content = file.read()

                    if "stripe" in content.lower():
                        existing["integrations"].add("stripe")
                    if "supabase" in content.lower():
                        existing["integrations"].add("supabase")
                    if "redis" in content.lower():
                        existing["integrations"].add("redis")
                    if "websocket" in content.lower():
                        existing["features"].add("websocket")
                    if "graphql" in content.lower():
                        existing["features"].add("graphql")
                    if "oauth" in content.lower():
                        existing["features"].add("oauth")
                    if "mcp" in content.lower():
                        existing["features"].add("mcp")
                    if "tool" in content.lower() and "def " in content:
                        existing["tools"].add(rel_path)
            except:
                pass

    return existing


def compare_and_generate_issues(
    hermes_features: Dict, opensin_features: Dict, repo_name: str
) -> List[MissingFeature]:
    """Compare Hermes with OpenSIN and generate issues for missing features"""
    issues = []

    # Check missing n8n workflows
    for wf in hermes_features.get("n8n_workflows", []):
        wf_name = wf.get("name", "")
        if wf_name and not any(
            wf_name.lower() in str(t).lower()
            for t in opensin_features.get("workflows", set())
        ):
            issues.append(
                MissingFeature(
                    title=f"[FEATURE] 🔴 Missing n8n Workflow: {wf_name}",
                    body=f"Hermes agent has n8n workflow '{wf_name}' that is missing in {repo_name}.\n\nDescription: {wf.get('description', 'N/A')}",
                    recommendation="Implement this n8n workflow to match Hermes functionality.",
                    labels=["feature", "n8n", "enhancement"],
                    category="feature",
                    hermes_path=wf.get("file", ""),
                    severity="HIGH",
                )
            )

    # Check missing API endpoints
    for api in hermes_features.get("api_endpoints", []):
        api_path = api.get("path", "")
        if api_path and not any(
            api_path.lower() in str(e).lower()
            for e in opensin_features.get("api_endpoints", set())
        ):
            issues.append(
                MissingFeature(
                    title=f"[FEATURE] 🔴 Missing API Endpoint: {api_path}",
                    body=f"Hermes agent has API endpoint '{api_path}' that is missing in {repo_name}.",
                    recommendation="Implement this API endpoint to match Hermes functionality.",
                    labels=["feature", "api", "enhancement"],
                    category="feature",
                    hermes_path=api.get("file", ""),
                    severity="MEDIUM",
                )
            )

    # Check missing UI components
    for comp in hermes_features.get("ui_components", []):
        comp_name = comp.get("name", "")
        if comp_name and comp_name.lower() not in [
            c.lower() for c in opensin_features.get("components", set())
        ]:
            issues.append(
                MissingFeature(
                    title=f"[FEATURE] 🔴 Missing UI Component: {comp_name}",
                    body=f"Hermes agent has UI component '{comp_name}' that is missing in {repo_name}.",
                    recommendation="Implement this UI component to match Hermes design system.",
                    labels=["feature", "ui", "enhancement"],
                    category="feature",
                    hermes_path=comp.get("file", ""),
                    severity="LOW",
                )
            )

    # Check missing tests
    for test in hermes_features.get("testing", []):
        test_name = test.get("name", "")
        if test_name and not any(
            test_name.lower() in str(t).lower()
            for t in opensin_features.get("tests", set())
        ):
            issues.append(
                MissingFeature(
                    title=f"[TESTING] 🔴 Missing Test: {test_name}",
                    body=f"Hermes agent has test '{test_name}' that is missing in {repo_name}.",
                    recommendation="Implement this test to match Hermes test coverage.",
                    labels=["testing", "enhancement"],
                    category="testing",
                    hermes_path=test.get("file", ""),
                    severity="MEDIUM",
                )
            )

    # Check missing integrations
    for integration in [
        "stripe",
        "supabase",
        "redis",
        "websocket",
        "graphql",
        "oauth",
        "mcp",
    ]:
        if integration in str(
            hermes_features
        ).lower() and integration not in opensin_features.get("integrations", set()):
            issues.append(
                MissingFeature(
                    title=f"[FEATURE] 🔴 Missing Integration: {integration.upper()}",
                    body=f"Hermes agent has {integration.upper()} integration that is missing in {repo_name}.",
                    recommendation=f"Implement {integration.upper()} integration to match Hermes functionality.",
                    labels=["feature", "integration", "enhancement"],
                    category="feature",
                    severity="HIGH",
                )
            )

    # Check missing auth rotator features
    for auth in hermes_features.get("auth_rotator", []):
        auth_name = auth.get("name", "")
        if auth_name and not any(
            auth_name.lower() in str(t).lower()
            for t in opensin_features.get("tools", set())
        ):
            issues.append(
                MissingFeature(
                    title=f"[FEATURE] 🔴 Missing Auth Feature: {auth_name}",
                    body=f"Hermes agent has auth feature '{auth_name}' that is missing in {repo_name}.",
                    recommendation="Implement this auth feature to match Hermes functionality.",
                    labels=["feature", "auth", "enhancement"],
                    category="feature",
                    hermes_path=auth.get("file", ""),
                    severity="MEDIUM",
                )
            )

    # Check missing AI chat features
    for chat in hermes_features.get("ai_chat", []):
        chat_name = chat.get("name", "")
        if chat_name and not any(
            "ai" in str(t).lower() and "chat" in str(t).lower()
            for t in opensin_features.get("features", set())
        ):
            issues.append(
                MissingFeature(
                    title=f"[FEATURE] 🔴 Missing AI Chat: {chat_name}",
                    body=f"Hermes agent has AI chat feature '{chat_name}' that is missing in {repo_name}.",
                    recommendation="Implement AI chat to match Hermes functionality.",
                    labels=["feature", "ai", "enhancement"],
                    category="feature",
                    hermes_path=chat.get("file", ""),
                    severity="HIGH",
                )
            )

    # Sort by severity
    severity_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    issues.sort(key=lambda x: severity_order.get(x.severity, 3))

    return issues


def scan_for_security_issues(path: str, repo_name: str) -> List[SecurityIssue]:
    """Scan for security issues in both Hermes and OpenSIN"""
    issues = []

    security_patterns = {
        "hardcoded_secret": {
            "pattern": r'(?:password|secret|token|api_key|apikey)\s*=\s*["\'][^"\']{8,}["\']',
            "severity": "CRITICAL",
            "title": "Hardcoded Secret/Credential",
            "body": "Secret/credential is hardcoded in source code.",
            "recommendation": "Use environment variables or secrets manager.",
        },
        "eval_usage": {
            "pattern": r"\beval\s*\(",
            "severity": "CRITICAL",
            "title": "eval() Usage - RCE Risk",
            "body": "eval() allows arbitrary code execution.",
            "recommendation": "Replace with json.loads() or ast.literal_eval().",
        },
        "shell_true": {
            "pattern": r"shell\s*=\s*True",
            "severity": "HIGH",
            "title": "shell=True - Command Injection",
            "body": "shell=True allows command injection.",
            "recommendation": "Use shell=False with list arguments.",
        },
        "sql_injection": {
            "pattern": r'f["\'].*(?:SELECT|INSERT|UPDATE|DELETE).*\{',
            "severity": "CRITICAL",
            "title": "SQL Injection via f-string",
            "body": "SQL query with f-string allows injection.",
            "recommendation": "Use parameterized queries.",
        },
        "cors_wildcard": {
            "pattern": r'allow_origins\s*=\s*\["\*"\]',
            "severity": "HIGH",
            "title": "CORS Wildcard",
            "body": "CORS allows all origins.",
            "recommendation": "Specify allowed origins explicitly.",
        },
        "debug_true": {
            "pattern": r"debug\s*=\s*True",
            "severity": "HIGH",
            "title": "Debug Mode Enabled",
            "body": "Debug mode exposes sensitive info.",
            "recommendation": "Set debug=False in production.",
        },
        "no_rate_limit": {
            "pattern": r"@app\.route|@router\.(?:get|post|put|delete)",
            "severity": "MEDIUM",
            "title": "No Rate Limiting",
            "body": "Endpoint lacks rate limiting.",
            "recommendation": "Add rate limiting middleware.",
        },
    }

    for root, dirs, files in os.walk(path):
        dirs[:] = [
            d
            for d in dirs
            if not d.startswith(".")
            and d
            not in ["node_modules", "__pycache__", "venv", ".venv", "dist", "build"]
        ]

        for file in files:
            if not file.endswith((".py", ".ts", ".js", ".json", ".yml", ".yaml")):
                continue

            filepath = os.path.join(root, file)
            rel_path = os.path.relpath(filepath, path)

            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except:
                continue

            for pattern_name, pattern_info in security_patterns.items():
                try:
                    matches = list(
                        re.finditer(
                            pattern_info["pattern"],
                            content,
                            re.IGNORECASE | re.MULTILINE,
                        )
                    )
                except re.error:
                    continue

                if matches:
                    issues.append(
                        SecurityIssue(
                            title=f"[SECURITY] [{pattern_info['severity']}] {pattern_info['title']} in {rel_path}",
                            body=f"{pattern_info['body']}\n\nFound {len(matches)} occurrence(s) in {repo_name}.",
                            recommendation=pattern_info["recommendation"],
                            labels=[
                                "security",
                                "bug",
                                f"priority:{pattern_info['severity'].lower()}",
                            ],
                            file_path=rel_path,
                            severity=pattern_info["severity"],
                        )
                    )

    return issues


def check_existing_issues(repo: str) -> Set[str]:
    """Get existing issue titles to avoid duplicates"""
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
            issues = json.loads(result.stdout)
            return {issue["title"] for issue in issues}
    except Exception as e:
        logger.warning(f"Could not fetch existing issues: {e}")
    return set()


def create_issue(repo: str, title: str, body: str, labels: List[str]) -> Optional[str]:
    """Create a GitHub Issue"""
    try:
        labels_str = ",".join(labels[:3])
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
                labels_str,
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except:
        return None


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Hermes-to-OpenSIN Comparator")
    parser.add_argument("--repo", required=True, help="GitHub repo (owner/repo)")
    parser.add_argument("--needed", type=int, default=50, help="Issues to create")
    parser.add_argument("--force", type=str, default="false", help="Force creation")
    parser.add_argument("--hermes-dir", required=True, help="Path to Hermes repo")
    parser.add_argument("--target-dir", required=True, help="Path to target repo")

    args = parser.parse_args()

    repo_name = args.repo.split("/")[-1]

    # Scan Hermes features
    logger.info("Scanning Hermes agent features...")
    hermes_features = extract_features_from_hermes(args.hermes_dir)
    logger.info(f"Hermes features found:")
    for cat, items in hermes_features.items():
        logger.info(f"  {cat}: {len(items)}")

    # Scan OpenSIN features
    logger.info(f"Scanning {repo_name} features...")
    opensin_features = scan_opensin_features(args.target_dir)
    logger.info(f"OpenSIN features found:")
    for cat, items in opensin_features.items():
        logger.info(f"  {cat}: {len(items)}")

    # Compare and generate issues
    logger.info("Comparing Hermes vs OpenSIN...")
    missing_features = compare_and_generate_issues(
        hermes_features, opensin_features, repo_name
    )
    logger.info(f"Missing features found: {len(missing_features)}")

    # Scan for security issues in both
    logger.info("Scanning for security issues...")
    hermes_security = scan_for_security_issues(args.hermes_dir, "sin-hermes-agent")
    opensin_security = scan_for_security_issues(args.target_dir, repo_name)
    all_security = hermes_security + opensin_security
    logger.info(f"Security issues found: {len(all_security)}")

    # Combine all issues
    all_issues = []

    # Add missing features
    for feat in missing_features:
        body = f"""## Problem
{feat.body}

## Hermes Reference
- **File:** `{feat.hermes_path}`

## Recommendation
{feat.recommendation}

---
*Auto-generated by Hermes-to-OpenSIN Comparator on {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}*
"""
        all_issues.append(
            {
                "title": feat.title,
                "body": body,
                "labels": feat.labels,
                "category": feat.category,
                "severity": feat.severity,
            }
        )

    # Add security issues
    for sec in all_security:
        body = f"""## Problem
{sec.body}

## Location
- **File:** `{sec.file_path}`

## Recommendation
{sec.recommendation}

---
*Auto-generated by Hermes-to-OpenSIN Comparator on {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}*
"""
        all_issues.append(
            {
                "title": sec.title,
                "body": body,
                "labels": sec.labels,
                "category": "security",
                "severity": sec.severity,
            }
        )

    # Check existing issues
    existing = check_existing_issues(args.repo)
    logger.info(f"Existing open issues: {len(existing)}")

    # Filter duplicates
    new_issues = [i for i in all_issues if i["title"] not in existing]

    # Sort by severity
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    new_issues.sort(key=lambda x: severity_order.get(x.get("severity", "MEDIUM"), 4))

    # Limit to needed
    issues_to_create = new_issues[: args.needed]

    logger.info(f"Will create {len(issues_to_create)} issues")

    # Create issues
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

    # Save results
    with open("hermes_comparator_results.json", "w") as f:
        json.dump(
            {
                "timestamp": datetime.now().isoformat(),
                "repo": args.repo,
                "hermes_features": {k: len(v) for k, v in hermes_features.items()},
                "opensin_features": {k: len(v) for k, v in opensin_features.items()},
                "missing_features": len(missing_features),
                "security_issues": len(all_security),
                "requested": args.needed,
                "created": created,
                "results": results,
            },
            f,
            indent=2,
        )

    logger.info(f"\n{'=' * 60}")
    logger.info(f"Done! Created {created}/{args.needed} issues")
    logger.info(f"{'=' * 60}")


if __name__ == "__main__":
    main()
