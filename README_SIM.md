# Frigg's Gate Mimick - SIM-KB Integration

This is a clone of Frigg's Gate with integrated SIM-KB Test functionality.

## Features

- All original Frigg's Gate features
- **NEW**: `/sim` command to enter SIM-KB mode for querying insurance carrier data

## SIM-KB Mode

Type `/sim` in the chat to enter SIM-KB mode. In this mode, you can ask questions about:

- Insurance carriers (e.g., Protective Life, Lincoln Financial)
- Product performance (Life, Annuity, ABLTC, Disability)
- Scorecards and research documents
- BPSer team roles

### Example Questions in SIM Mode:

- "What carriers do we have data for?"
- "Tell me about Protective Life"
- "How did Protective Life perform in Annuities?"
- "What are the BPSer team roles?"

### SIM Mode Commands:

- `clear` - Clear conversation history
- `stats` - Show database statistics
- `help` - Show help message
- `/sim` - Exit SIM-KB mode

## Setup

### 1. Install Frontend Dependencies

```bash
cd /Users/jacksonrishel/friggs-gate-mimick
yarn install
```

### 2. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set OpenAI API Key

Make sure you have an OpenAI API key set in your environment or in the bifrost-mimick .env file:

```bash
export OPENAI_API_KEY="your-api-key"
```

The sim_kb_server will automatically load the API key from `/Users/jacksonrishel/bifrost-mimick/.env` if it exists.

### 4. Start the SIM-KB Backend Server

```bash
python sim_kb_server.py
```

This will start the server on `http://localhost:5001`.

### 5. Start the Frontend

In a separate terminal:

```bash
yarn dev
```

This will start the Next.js frontend on `http://localhost:3000`.

## Usage

1. Open `http://localhost:3000` in your browser
2. Type `/sim` in the chat to enter SIM-KB mode
3. Ask questions about insurance carriers
4. Type `/sim` again to exit SIM-KB mode

## Architecture

- **Frontend**: Next.js 13 app with React and TypeScript
- **Backend**: Flask server wrapping the sim_kb_test Python module
- **Data**: SQLite database with insurance carrier information

## File Structure

```
friggs-gate-mimick/
├── app/                        # Next.js frontend
│   ├── components/
│   │   └── ChatWindow.tsx      # Main chat component with /sim handler
│   └── config/
│       └── commands.ts         # Command definitions
├── sim_kb_test/                # SIM-KB Python module
│   ├── chat_interface.py
│   ├── llm_navigator.py
│   ├── db_manager.py
│   └── ...
├── sim_kb_server.py            # Flask backend server
├── requirements.txt            # Python dependencies
└── README_SIM.md               # This file
```

## Development

To modify the SIM-KB functionality:

1. Edit files in the `sim_kb_test/` directory
2. Restart the `sim_kb_server.py` backend

To modify the `/sim` command behavior:

1. Edit `app/components/ChatWindow.tsx`
2. The Next.js dev server will auto-reload

## Troubleshooting

### SIM-KB server not responding

- Make sure the backend is running: `python sim_kb_server.py`
- Check that port 5001 is not in use by another process
- Verify the OpenAI API key is set correctly

### Database not found errors

- Run the setup script from bifrost-mimick:
  ```bash
  cd /Users/jacksonrishel/bifrost-mimick/cyphers/bpser/sim_kb_test
  python setup_database.py
  ```

### CORS errors

- Make sure flask-cors is installed: `pip install flask-cors`
- The server should print "CORS enabled" on startup

## Credits

- Original Frigg's Gate by Jackson Rishel
- SIM-KB integration by Claude Code
