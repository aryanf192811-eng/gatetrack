Set objShell = WScript.CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where the VBS script is located
scriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
widgetHtmlPath = objFSO.BuildPath(objFSO.GetParentFolderName(objFSO.GetParentFolderName(scriptDir)), "widget.html")

' Ensure the path is properly formatted for a file:// URL
fileUrl = "file:///" & Replace(widgetHtmlPath, "\", "/")

' Preferred browsers in order
' msedge supports native --app really well on Windows
command = "msedge --app=""" & fileUrl & """ --window-size=400,680 --window-position=1480,50 --no-default-browser-check"

' Run the command completely hidden (0) so no command prompt flashes
objShell.Run command, 0, False
