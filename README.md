# ecornell-error-augmentation
With tooltip configuration, context filtering, and passing multiple student files as context.
This assistant is designed to explain student programming error messages and provide minimal code examples.
<br />

<a href="https://github.com/codio-extensions/custom-assistant-example-error-augmentation" target="_blank">Original Fork From Codio</a>

## Supported Courses:
- CIS540s: 
- CIS560s: 

## Features:

### Error Explanation:
- Only activates "I can help explain this error" tooltip for errors, doesn't show it for autograder feedback
- Filter information from context by using specific guidelines in the prompts to ignore certain information
- Passes all open files as student code context

### Example Generation:
- Provides minimal examples (less than 10 lines of code)
- Focuses on demonstrating one concept at a time
- Uses descriptive variable names with random uppercase letter suffixes
- Includes automatic comment headers for generated examples
- Maintains a learning-focused approach without providing direct solutions

### Customization:
- Tweak the systemPrompt or userPrompt to change/edit/update custom explanations
- Control explanation style (with/without code snippets, with/without misconceptions)
- Adjust the tone and level of detail in explanations
