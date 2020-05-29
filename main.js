// Modules to control application life and create native browser window
const { app, Tray, Menu } = require("electron");
const spawn = require("child_process").spawn;

let heated = false;
let speed = 100;
let ready = false;

app.whenReady().then(() => {
  const tray = new Tray("./icons/rocket.png");
  const pmset = spawn("pmset", ["-g", "thermlog"]);
  pmset.stdout.on("data", (data) => {
    speed =
      data.toString().indexOf("CPU_Speed_Limit \t= ") > -1
        ? Number(
            data.toString().slice(
              data.toString().indexOf("CPU_Speed_Limit \t= ") + 19,
              data.toString().indexOf("CPU_Speed_Limit \t= ") +
                19 +
                data
                  .toString()
                  .slice(data.toString().indexOf("CPU_Speed_Limit \t= ") + 19)
                  .indexOf("\n")
            )
          )
        : 101;

    if (speed === 100) {
      heated = false;
      ready = true;
    }
    if (speed < 100) {
      heated = true;
      ready = true;
    }
    if (speed === 101) {
      heated = false;
      ready = false;
    }
    tray.setImage(
      !ready
        ? "./icons/clock.png"
        : heated
        ? "./icons/fire.png"
        : "./icons/rocket.png"
    );
    if (ready) {
      tray.setToolTip(heated ? "Stai andando a fuoco!" : "Tutto bene");
    }
    tray.setTitle(ready ? `${speed}%` : "Loading");
  });
  pmset.stderr.on("data", (data) => console.log("stderr: ", data.toString()));
  pmset.on("exit", (data) =>
    console.log("child process exited with code: ", data)
  );

  tray.setContextMenu(
    Menu.buildFromTemplate([{ label: "Exit", click: () => app.quit() }])
  );
});
