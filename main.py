from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
from langchain_cohere import ChatCohere
from langchain_core.messages import HumanMessage

app = FastAPI()

llm = ChatCohere(cohere_api_key='lMQ2FCVWccphyyB10tGpZg3oinBjGOixW0D3fmPd')

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.websocket("/transcribe")
async def transcribe(websocket: WebSocket):
  await websocket.accept()

  while True:
    human_input = await websocket.receive_text()
    if human_input:
      human_message = [HumanMessage(content=human_input)]
      response = llm.invoke(human_message, max_tokens=80)
      await websocket.send_text(response.content)

if __name__ == "__main__":
  uvicorn.run(app, host="0.0.0.0", port=5000)
