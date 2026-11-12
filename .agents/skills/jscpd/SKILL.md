---
name: jscpd
description: Use jscpd with AI coding assistants to automatically detect and refactor code duplications.
---

# Agent Skill

> Use jscpd with AI coding assistants to automatically detect and refactor code duplications.

## Overview

jscpd ships **two agent skills** for [skills.sh](https://skills.sh) that teach AI coding assistants (Claude, Copilot, Gemini, Cursor, and others) how to detect and eliminate code duplication:

1. **jscpd** — tool reference skill. Covers all CLI options, the AI reporter output format, and configuration file syntax.
2. **dry-refactoring** — refactoring workflow skill. A guided process for reading clone output, choosing the right extraction strategy, applying the refactor, and verifying the clone is eliminated.

## Installation

```bash [Terminal]
# Install both skills
npx skills add kucherenko/jscpd

# Or install individually
npx skills add kucherenko/jscpd --skill jscpd
npx skills add kucherenko/jscpd --skill dry-refactoring
```

Once installed, ask your agent to "find and fix code duplication" and it will invoke jscpd with the right options and act on the results.

## jscpd Skill

The **jscpd** skill instructs the agent to:

1. Run jscpd with the `ai` reporter on the target path
2. Parse the detected clone pairs (file paths + line ranges)
3. Report back with a summary of duplications

### Key Options

<table>
<thead>
  <tr>
    <th>
      Option
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        --reporters ai
      </code>
    </td>
    
    <td>
      Use the AI-optimized reporter (compact clone list)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --reporters html
      </code>
    </td>
    
    <td>
      Generate HTML report
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --min-tokens N
      </code>
    </td>
    
    <td>
      Minimum tokens for a duplication (default: 50)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --min-lines N
      </code>
    </td>
    
    <td>
      Minimum lines for a duplication (default: 5)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --ignore "glob"
      </code>
    </td>
    
    <td>
      Ignore patterns (comma-separated)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --format "list"
      </code>
    </td>
    
    <td>
      Limit to specific languages
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --store "type"
      </code>
    </td>
    
    <td>
      Accepted for compatibility; external stores not available in v5 (detection is fast enough)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --store-path "path"
      </code>
    </td>
    
    <td>
      Accepted for compatibility; not used in v5
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --noTips
      </code>
    </td>
    
    <td>
      Disable tips in output (also suppressed by <code>
        --silent
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --skipComments
      </code>
    </td>
    
    <td>
      Alias for <code>
        --mode weak
      </code>
      
       (strip comments before detection)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --formats-names "map"
      </code>
    </td>
    
    <td>
      Map filenames to formats
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --mode "mode"
      </code>
    </td>
    
    <td>
      Detection quality: <code>
        strict
      </code>
      
      , <code>
        mild
      </code>
      
      , <code>
        weak
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --blame
      </code>
    </td>
    
    <td>
      Blame authors of duplications from git
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --silent
      </code>
    </td>
    
    <td>
      Do not write detection progress and results to console
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --absolute
      </code>
    </td>
    
    <td>
      Use absolute paths in reports
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --ignoreCase
      </code>
    </td>
    
    <td>
      Ignore case of symbols in code (experimental)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --exitCode N
      </code>
    </td>
    
    <td>
      Exit code when duplications are detected
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --verbose
      </code>
    </td>
    
    <td>
      Show full information during detection process
    </td>
  </tr>
</tbody>
</table>

### Example Configuration

```json [.jscpd.json]
{
  "threshold": 0,
  "reporters": ["ai"],
  "ignore": ["**/node_modules/**", "**/dist/**", "**/*.min.*"],
  "format": ["typescript", "javascript"],
  "minLines": 5,
  "minTokens": 50,
  "output": "./reports/jscpd"
}
```

## dry-refactoring Skill

The **dry-refactoring** skill guides the agent through eliminating duplications:

1. Run jscpd with `--reporters ai` on the target path
2. Parse each clone line to identify the two duplicated locations (file + line range)
3. Read both code fragments from the source files
4. Understand what the duplicated code does
5. Design a refactoring — extract a shared function, class, module, or constant
6. Apply the refactoring — update both locations and all other usages
7. Re-run jscpd to confirm the clone is eliminated
8. Repeat for remaining clones, highest-impact first

### Refactoring Strategies

<table>
<thead>
  <tr>
    <th>
      Strategy
    </th>
    
    <th>
      When to use
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <strong>
        Extract function
      </strong>
    </td>
    
    <td>
      Duplicate is a block of logic
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        Extract module/utility
      </strong>
    </td>
    
    <td>
      Duplicate spans multiple files in different domains
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        Extract constant/config
      </strong>
    </td>
    
    <td>
      Duplicate is repeated data or configuration
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        Template/base class
      </strong>
    </td>
    
    <td>
      Duplicate has a repeated class shape
    </td>
  </tr>
</tbody>
</table>

### Tips

- Start with clones that have the highest line count — most impact
- A clone between test files may indicate a missing test helper
- Clones across unrelated modules may signal a missing shared utility
- Use `--min-lines 10` to filter noise and focus on meaningful duplications

## How It Uses the AI Reporter

The skills use the `ai` reporter, which produces compact, token-efficient output:

```bash [Terminal]
npx jscpd --reporters ai ./src
```

Example output:

```text
Clones:
src/utils/ auth.ts:10-25 ~ helpers.ts:40-55
src/utils/auth.ts 30-45 ~ 80-95
---
2 clones · 3.1% duplication
```

This format uses ~79% fewer tokens than the default reporter, keeping context usage low while giving the agent everything it needs to locate and fix each duplication.

## More Information

- Skill page: [skills.sh/kucherenko/jscpd](https://skills.sh/kucherenko/jscpd)
- AI Reporter docs: [Reporters](/reporters)
- Configuration: [Configuration](/getting-started/configuration)
