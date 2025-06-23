// Wrapping the whole extension in a JS function and calling it immediately 
// (ensures all global variables set in this extension cannot be referenced outside its scope)
(async function(codioIDE, window) {
  
  // Refer to Anthropic's guide on system prompts: https://docs.anthropic.com/claude/docs/system-prompts
 const systemPrompt = `You are a helpful assistant helping students understand programming error messages.

You will be provided with the assignment instructions in the <assignment> tag, 
all the student code files in the <code> tag and a programming error message in the <error_message> tag.

When explaining errors:
- Carefully review the <assignment> and <code>, if provided, to understand the context of the error
- Explain what is causing the error only
- Do not provide possible fixes and solutions
- If relevant, mention any common misconceptions that may be contributing to the student's error
- When referring to code in your explanation, use markdown syntax - wrap inline code with \` and multiline code with \`\`\`

When providing examples:
- Only provide minimal examples of less than 10 lines of code
- Focus on demonstrating one concept at a time
- Add a comment '// Generated example' at the top of any example code
- Use descriptive variable names with random uppercase letter suffixes that are different for each identifier
- Thoroughly explain how the example works and why it works
- Be positive and encouraging in your explanations, but not condescending
- Never write actual assignment code, only illustrative examples

Remember to stay focused on helping students learn rather than solving their problems directly.`


  // register(id: unique button id, name: name of button visible in Coach, function: function to call when button is clicked) 
  codioIDE.coachBot.register("eCornellErrorAugmentButton", "Help explain an error", onButtonPress)

  async function onButtonPress() {
    // Function that automatically collects all available context 
    // returns the following object: {guidesPage, assignmentData, files, error}

    let context = await codioIDE.coachBot.getContext()
    // console.log(`This is the context object \n\n`, context)

    var all_open_files = ""

    for (const [fileIndex, file] of Object.entries(context.files)) {
      // console.log("This is the file object", file)
      all_open_files += `
      -----------------------------
      File Number: ${parseInt(fileIndex)+1}
      File name: ${file.path.split('/').pop()}
      File path: ${file.path}
      File content: 
      ${file.content}
      -----------------------------
      `
    }
    // console.log(`These are concatenated all open files\n\n ${all_open_files}`)

    let input

      try {
        input = await codioIDE.coachBot.input("Please paste the error message you want me to explain!")
      }  catch (e) {
          if (e.message == "Cancelled") {
            codioIDE.coachBot.write("Please feel free to have any other error messages explained!")
            codioIDE.coachBot.showMenu()
            return
          }
      }
    
    
    // console.log(input)

    const valPrompt = `<Instructions>

Please determine whether the following text appears to be a programming error message or not:

<text>
${input}
</text>

Output your final Yes or No answer in JSON format with the key 'answer'

Focus on looking for key indicators that suggest the text is an error message, such as:

- Words like "error", "exception", "stack trace", "traceback", etc.
- Line numbers, file names, or function/method names
- Language that sounds like it is reporting a problem or issue
- Language that sounds like it is providing feedback
- Technical jargon related to coding/programming

If you don't see clear signs that it is an error message, assume it is not. 
Only answer "Yes" if you are quite confident it is an error message. 
If it is not a traditional error message, only answer "Yes" if it sounds like it is providing feedback as part of an automated grading system.

</Instructions>"`

    const validation_result = await codioIDE.coachBot.ask({
        systemPrompt: "You are a helpful assistant.",
        userPrompt: valPrompt
    }, {stream:false, preventMenu: true})

    if (validation_result.result.includes("Yes")) {
        //Define your assistant's userPrompt - this is where you will provide all the context you collected along with the task you want the LLM to generate text for.
        const userPrompt = `
Here is the error message:

<error_message>
${input}
</error_message>

Here is the description of the programming assignment the student is working on:

<assignment>
${context.guidesPage.content}
</assignment>

Note: Here is a list of items that are not part of the assignment instructions:
1. Anything in html <style> tags.
2. Anything in htmk <script> tags.
3. Anything that resembles autograder feedback about passing or failing tests, i.e. check passed, total passed, total failed, etc.

If any of the above are present in the <assignment>, ignore them as if they're not provided to you

Here are the student's code files:
<code>
${all_open_files}
</code>

If <assignment> and <code> are empty, assume that they're not available. 

Phrase your explanation directly addressing the student as 'you'. 
After writing your explanation in 2-3 sentences, double check that it does not suggest any fixes or solutions. 
The explanation should only describe the cause of the error.`
      
      console.log("user prompt", userPrompt)
      const result = await codioIDE.coachBot.ask({
        systemPrompt: systemPrompt,
        messages: [{"role": "user", "content": userPrompt}]
      })
    }
    else {
        codioIDE.coachBot.write("This doesn't look like an error. I'm sorry, I can only help you by explaining programming error messages.")
        codioIDE.coachBot.showMenu()
    }
  }

})(window.codioIDE, window)
