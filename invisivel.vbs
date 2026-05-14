Set WshShell = CreateObject("WScript.Shell")

WshShell.CurrentDirectory = "C:\Users\biaon\Desktop\4studies"

WshShell.Run "cmd /c npm run start", 0, False
WshShell.Run "cmd /c python app.py", 0, False