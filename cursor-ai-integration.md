# Cursor AI Integration Instructions

## How Cursor AI Should Monitor Instructions

### 1. Monitor the Instruction File
Cursor AI should monitor `cursor-instructions.json` for new instructions from ChatGPT.

### 2. File Structure
The file will contain instructions in this format:
```json
{
  "instructions": [
    {
      "id": "command-id",
      "type": "ai_assistant_instruction",
      "assistant_id": "cursor_ai",
      "task": "Create a modern React login form",
      "context": "User wants a professional login form with validation",
      "prompts": [
        "Create a LoginForm.tsx component with TypeScript",
        "Use react-hook-form for form validation",
        "Add Material-UI components for styling"
      ],
      "code_examples": {
        "form_structure": "example code",
        "validation": "yup schema"
      },
      "requirements": ["TypeScript", "React Hook Form", "Material-UI"],
      "timestamp": "2024-01-01T12:00:00.000Z",
      "status": "pending",
      "source": "chatgpt"
    }
  ],
  "lastUpdated": "2024-01-01T12:00:00.000Z",
  "note": "This file is monitored by Cursor AI for new instructions from ChatGPT"
}
```

### 3. Cursor AI Response Process

When Cursor AI detects a new instruction:

1. **Read the instruction** from `cursor-instructions.json`
2. **Parse the task, context, and requirements**
3. **Execute the task** using the provided prompts and examples
4. **Update the instruction status** to "completed" or "failed"
5. **Report results** back to the user

### 4. Example Cursor AI Workflow

```
1. Monitor cursor-instructions.json
2. Detect new instruction: "Create React login form"
3. Read context: "Professional form with validation"
4. Execute prompts:
   - Create LoginForm.tsx with TypeScript
   - Add react-hook-form validation
   - Style with Material-UI
5. Report completion: "Login form created successfully"
```

### 5. Status Updates

Cursor AI should update the instruction status:
```json
{
  "status": "completed",
  "result": "LoginForm.tsx created with TypeScript, validation, and Material-UI styling",
  "completedAt": "2024-01-01T12:05:00.000Z"
}
```

### 6. Real-Time Communication

This creates a real-time loop:
1. **ChatGPT** → Sends instruction via Custom Action
2. **Local Commander** → Writes to cursor-instructions.json
3. **Cursor AI** → Reads and executes instruction
4. **ChatGPT** → Sees results and can provide feedback

## Benefits

✅ **Real-time collaboration** between ChatGPT and Cursor AI
✅ **Structured instructions** with context and examples
✅ **Seamless workflow** from ChatGPT to local development
✅ **Two-way communication** with status updates
✅ **Scalable architecture** for complex tasks

## Next Steps

1. Start the local commander: `node local-commander.js`
2. Configure Cursor AI to monitor cursor-instructions.json
3. Test with ChatGPT Custom Action
4. Enjoy real-time AI collaboration! 🚀 