#!/usr/bin/env python3
"""
HDD Marketing Tools Launcher
Launch and manage all Hickory Dickory Decks marketing tools from one place.
"""

import subprocess
import webbrowser
import time
import os
import sys
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent

# Tool definitions
TOOLS = {
    "1": {
        "name": "Dashboard",
        "type": "static",
        "path": "hdd-dashboard/index.html",
        "description": "Main dashboard showing all tools"
    },
    "2": {
        "name": "Quote Calculator",
        "type": "static",
        "path": "hdd-quote-calculator/index.html",
        "description": "Customer-facing deck estimate calculator"
    },
    "3": {
        "name": "Sentiment Router",
        "type": "static",
        "path": "hdd-sentiment-router/index.html",
        "description": "Routes customers to reviews or feedback"
    },
    "4": {
        "name": "Review Generator",
        "type": "vite",
        "path": "hdd-review-generator",
        "port": 5173,
        "description": "Generate review request messages"
    },
    "5": {
        "name": "Photo Manager",
        "type": "vite",
        "path": "hdd-photo-manager",
        "port": 5174,
        "description": "Organize before/after project photos"
    },
    "6": {
        "name": "Referral Tracker",
        "type": "vite",
        "path": "hdd-referral-tracker",
        "port": 5175,
        "description": "Track leads and referral codes"
    },
    "7": {
        "name": "Warranty Tracker",
        "type": "vite",
        "path": "hdd-warranty-tracker",
        "port": 5176,
        "description": "Track warranties and schedule checkups"
    },
    "8": {
        "name": "Weather Content",
        "type": "vite",
        "path": "hdd-weather-content",
        "port": 5177,
        "description": "Weather-based content suggestions"
    },
    "9": {
        "name": "Competitor Monitor",
        "type": "vite",
        "path": "hdd-competitor-monitor",
        "port": 5178,
        "description": "Track competitor Google ratings"
    },
    "10": {
        "name": "GBP Post Scheduler",
        "type": "next",
        "path": "hdd-gbp-poster",
        "port": 3000,
        "description": "AI-powered Google Business Profile posts (needs env setup)"
    },
    "11": {
        "name": "Lead Response System",
        "type": "next",
        "path": "hdd-lead-response",
        "port": 3001,
        "description": "Automated lead follow-up (needs env setup)"
    }
}

# Track running processes
running_processes = {}


def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')


def print_header():
    print("\n" + "="*60)
    print("🔨 HDD MARKETING TOOLS LAUNCHER")
    print("   Hickory Dickory Decks Cincinnati")
    print("="*60)


def print_menu():
    print("\n📋 AVAILABLE TOOLS:\n")
    print("   STATIC (open directly in browser):")
    for key, tool in TOOLS.items():
        if tool["type"] == "static":
            status = "🟢" if key in running_processes else "⚪"
            print(f"   [{key}] {status} {tool['name']}")
            print(f"       {tool['description']}")
    
    print("\n   REACT/VITE (dev server required):")
    for key, tool in TOOLS.items():
        if tool["type"] == "vite":
            status = "🟢" if key in running_processes else "⚪"
            port_info = f"(port {tool['port']})"
            print(f"   [{key}] {status} {tool['name']} {port_info}")
            print(f"       {tool['description']}")
    
    print("\n   NEXT.JS (needs environment setup):")
    for key, tool in TOOLS.items():
        if tool["type"] == "next":
            status = "🟢" if key in running_processes else "⚪"
            port_info = f"(port {tool['port']})"
            print(f"   [{key}] {status} {tool['name']} {port_info}")
            print(f"       {tool['description']}")
    
    print("\n" + "-"*60)
    print("   [A] Launch ALL tools")
    print("   [S] Launch STATIC tools only (no server needed)")
    print("   [R] Launch REACT tools only")
    print("   [K] Kill all running servers")
    print("   [Q] Quit")
    print("-"*60)


def launch_static(tool_key):
    """Launch a static HTML tool in the browser"""
    tool = TOOLS[tool_key]
    file_path = BASE_DIR / tool["path"]
    
    if not file_path.exists():
        print(f"   ❌ File not found: {file_path}")
        return False
    
    print(f"   🌐 Opening {tool['name']}...")
    webbrowser.open(f"file:///{file_path}")
    running_processes[tool_key] = "browser"
    return True


def launch_vite(tool_key):
    """Launch a Vite dev server"""
    tool = TOOLS[tool_key]
    tool_path = BASE_DIR / tool["path"]
    
    if not tool_path.exists():
        print(f"   ❌ Directory not found: {tool_path}")
        return False
    
    # Check if node_modules exists
    if not (tool_path / "node_modules").exists():
        print(f"   📦 Installing dependencies for {tool['name']}...")
        subprocess.run(["npm", "install"], cwd=tool_path, shell=True)
    
    print(f"   🚀 Starting {tool['name']} on port {tool['port']}...")
    
    # Start the dev server
    process = subprocess.Popen(
        ["npm", "run", "dev", "--", "--port", str(tool["port"])],
        cwd=tool_path,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    running_processes[tool_key] = process
    time.sleep(2)  # Give it time to start
    
    # Open in browser
    url = f"http://localhost:{tool['port']}"
    print(f"   🌐 Opening {url}")
    webbrowser.open(url)
    
    return True


def launch_next(tool_key):
    """Launch a Next.js dev server"""
    tool = TOOLS[tool_key]
    tool_path = BASE_DIR / tool["path"]
    
    if not tool_path.exists():
        print(f"   ❌ Directory not found: {tool_path}")
        return False
    
    # Check for .env file
    env_file = tool_path / ".env"
    if not env_file.exists():
        print(f"   ⚠️  {tool['name']} needs environment setup!")
        print(f"      Copy .env.example to .env and fill in values")
        print(f"      Path: {tool_path}")
        return False
    
    # Check if node_modules exists
    if not (tool_path / "node_modules").exists():
        print(f"   📦 Installing dependencies for {tool['name']}...")
        subprocess.run(["npm", "install"], cwd=tool_path, shell=True)
    
    print(f"   🚀 Starting {tool['name']} on port {tool['port']}...")
    
    # Start the dev server
    process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=tool_path,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env={**os.environ, "PORT": str(tool["port"])}
    )
    
    running_processes[tool_key] = process
    time.sleep(3)  # Next.js takes longer to start
    
    # Open in browser
    url = f"http://localhost:{tool['port']}"
    print(f"   🌐 Opening {url}")
    webbrowser.open(url)
    
    return True


def launch_tool(tool_key):
    """Launch a single tool"""
    if tool_key not in TOOLS:
        print(f"   ❌ Invalid tool number: {tool_key}")
        return
    
    tool = TOOLS[tool_key]
    print(f"\n🔧 Launching {tool['name']}...")
    
    if tool["type"] == "static":
        launch_static(tool_key)
    elif tool["type"] == "vite":
        launch_vite(tool_key)
    elif tool["type"] == "next":
        launch_next(tool_key)


def launch_all():
    """Launch all tools"""
    print("\n🚀 LAUNCHING ALL TOOLS...\n")
    for key in TOOLS.keys():
        launch_tool(key)
        time.sleep(0.5)
    print("\n✅ All tools launched!")


def launch_static_only():
    """Launch only static tools"""
    print("\n🚀 LAUNCHING STATIC TOOLS...\n")
    for key, tool in TOOLS.items():
        if tool["type"] == "static":
            launch_tool(key)
            time.sleep(0.3)
    print("\n✅ Static tools launched!")


def launch_react_only():
    """Launch only React/Vite tools"""
    print("\n🚀 LAUNCHING REACT TOOLS...\n")
    for key, tool in TOOLS.items():
        if tool["type"] == "vite":
            launch_tool(key)
            time.sleep(1)
    print("\n✅ React tools launched!")


def kill_all():
    """Kill all running dev servers"""
    print("\n🛑 Stopping all servers...")
    for key, process in list(running_processes.items()):
        if process != "browser" and process is not None:
            try:
                process.terminate()
                print(f"   Stopped {TOOLS[key]['name']}")
            except:
                pass
    running_processes.clear()
    print("✅ All servers stopped")


def show_status():
    """Show status of running tools"""
    print("\n📊 RUNNING TOOLS:")
    if not running_processes:
        print("   No tools currently running")
    else:
        for key in running_processes:
            tool = TOOLS[key]
            if tool["type"] == "static":
                print(f"   🟢 {tool['name']} (browser)")
            else:
                port = tool.get("port", "?")
                print(f"   🟢 {tool['name']} → http://localhost:{port}")


def main():
    clear_screen()
    print_header()
    
    while True:
        print_menu()
        show_status()
        
        choice = input("\n👉 Enter choice: ").strip().upper()
        
        if choice == "Q":
            kill_all()
            print("\n👋 Goodbye!\n")
            break
        elif choice == "A":
            launch_all()
        elif choice == "S":
            launch_static_only()
        elif choice == "R":
            launch_react_only()
        elif choice == "K":
            kill_all()
        elif choice in TOOLS:
            launch_tool(choice)
        else:
            print(f"\n❌ Invalid choice: {choice}")
        
        input("\nPress Enter to continue...")
        clear_screen()
        print_header()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ Interrupted!")
        kill_all()
        sys.exit(0)
