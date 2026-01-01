# Testing Guide for SIM-KB Integration

## Quick Start (3 Steps)

### 1. Start the SIM-KB Backend

```bash
cd /Users/jacksonrishel/friggs-gate-mimick
python sim_kb_server.py
```

You should see:
```
🚀 Starting SIM-KB Server...
📡 Listening on http://localhost:5001
💬 Chat endpoint: POST http://localhost:5001/sim/chat
🔄 Reset endpoint: POST http://localhost:5001/sim/reset
❤️  Health check: GET http://localhost:5001/health
 * Running on http://0.0.0.0:5001
```

**Note**: Make sure you have the OpenAI API key set. The server will load it from `/Users/jacksonrishel/bifrost-mimick/.env` automatically.

### 2. Start the Frontend (in a new terminal)

```bash
cd /Users/jacksonrishel/friggs-gate-mimick
yarn install  # Only needed once
yarn dev
```

You should see:
```
- Local:        http://localhost:3000
```

### 3. Test in Browser

1. Open http://localhost:3000
2. Type `/sim` in the chat
3. You should see a welcome message
4. Ask a question like "What carriers do we have data for?"
5. Type `/sim` again to exit

## Test Cases

### Basic Flow

1. **Enter SIM Mode**
   - Type: `/sim`
   - Expected: Welcome message with example questions

2. **Ask a Simple Question**
   - Type: `What carriers do we have data for?`
   - Expected: List of ~25 insurance carriers

3. **Ask About a Specific Carrier**
   - Type: `Tell me about Protective Life`
   - Expected: Information about Protective Life's documents and products

4. **Ask About Performance**
   - Type: `How did Protective Life perform in Annuities?`
   - Expected: Scorecard breakdown with rankings

5. **Exit SIM Mode**
   - Type: `/sim`
   - Expected: "Exited SIM-KB mode" message

### Commands to Test

While in SIM mode:
- `stats` - Should show database statistics
- `help` - Should show help message
- `clear` - Should clear conversation history

### Error Cases to Test

1. **SIM Server Not Running**
   - Stop the sim_kb_server.py
   - Try asking a question in SIM mode
   - Expected: Error message about server connection

2. **No API Key**
   - Unset OPENAI_API_KEY
   - Ask a question in SIM mode
   - Expected: Error message about missing API key

3. **Invalid Question**
   - Ask about a carrier that doesn't exist
   - Expected: Graceful message saying carrier not found

## Troubleshooting

### Backend won't start

**Error**: `ModuleNotFoundError: No module named 'flask'`
**Fix**:
```bash
pip install -r requirements.txt
```

**Error**: `openai.OpenAIError: The api_key client option must be set`
**Fix**:
```bash
export OPENAI_API_KEY="your-api-key-here"
```
Or make sure `/Users/jacksonrishel/bifrost-mimick/.env` has the key.

### Frontend won't start

**Error**: `command not found: yarn`
**Fix**:
```bash
npm install -g yarn
```

**Error**: Module errors
**Fix**:
```bash
rm -rf node_modules
yarn install
```

### SIM mode not working

**Issue**: Type `/sim` but nothing happens
**Check**:
1. Is sim_kb_server.py running? (Check terminal)
2. Is it on port 5001? (Check for errors)
3. Check browser console for CORS errors

**Issue**: "SIM-KB server error" when asking questions
**Check**:
1. Is the backend responding? Test: `curl http://localhost:5001/health`
2. Check sim_kb_server.py terminal for error messages
3. Check browser console for detailed error messages

### Database errors

**Error**: "Database not found" or "no such table"
**Fix**:
```bash
cd /Users/jacksonrishel/bifrost-mimick/cyphers/bpser/sim_kb_test
python setup_database.py
```

## Architecture Overview

```
Browser (localhost:3000)
    ↓
    Type /sim → Enter SIM mode
    ↓
    Type question
    ↓
ChatWindow.tsx (checks isSimMode)
    ↓
    If isSimMode:
        HTTP POST to localhost:5001/sim/chat
    ↓
sim_kb_server.py (Flask)
    ↓
LLMNavigator (sim_kb_test)
    ↓
OpenAI API + SQLite DB
    ↓
    Response back through the chain
```

## Success Criteria

You'll know it's working when:
1. ✅ Backend starts without errors
2. ✅ Frontend starts and opens in browser
3. ✅ `/sim` command shows welcome message
4. ✅ Questions return formatted markdown responses
5. ✅ Can exit with `/sim` command
6. ✅ Regular chat still works (not in SIM mode)

## Next Steps

Once basic testing works:
- Try more complex questions from USER_GUIDE.md
- Test the built-in commands (stats, help, clear)
- Try asking follow-up questions to test conversation history
- Test edge cases (empty input, very long questions, etc.)

## Support

If you encounter issues not covered here:
1. Check sim_kb_server.py terminal for backend errors
2. Check browser console for frontend errors
3. Check the original sim_kb_test documentation in bifrost-mimick
4. Verify OpenAI API key is valid and has credits
