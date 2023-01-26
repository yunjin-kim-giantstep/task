import { datas } from "./constant.js";

class Counter {
  constructor(datas) {
    this.startButton = document.getElementById("start");
    this.stopButton = document.getElementById("stop");
    this.pauseButton = document.getElementById("pause");
    this.resumeButton = document.getElementById("resume");
    this.goButton = document.getElementById("go");
    this.backButton = document.getElementById("back");
    this.prevJumpButton = document.getElementById("prev-jump");
    this.nextJumpButton = document.getElementById("next-jump");
    this.textResult = document.getElementById("text-result");
    this.remainText = document.getElementById("text-remain");
    this.buttonArea = document.getElementById("button-area");

    this.datas = datas;

    this.number = 0;
    this.timerId = null;
    this.flag = "BEFORE"; // RUN, FREEZE
    this.startTime = 0;
    this.pauseTime = 0;
    this.currentDelay = this.datas[this.number]?.preDelay;
    this.timeouts = [];
    this.texts = [];
    this.isGo = true;
    this.isJump = false;
    this.delayMode = "PRE"; // AFTER

    this.buttonArea.addEventListener("click", (e) => {
      switch (e.target.id) {
        case "start":
          if (this.flag !== "BEFORE") return;
          this.start();
          this.flag = "RUN";
          break;
        case "stop":
          this.stop();
          this.flag = "BEFORE";
          break;
        case "pause":
          if (this.flag !== "RUN") return;
          this.pause();
          this.flag = "FREEZE";
          break;
        case "resume":
          if (this.flag !== "FREEZE") return;
          this.flag = "RUN";

          this.resume();
          break;
        case "go":
          this.go();
          this.flag = "RUN";
          break;
        case "back":
          this.back();
          this.flag = "RUN";
          break;
        case "prev-jump":
          this.prevJump();
          break;
        case "next-jump":
          this.nextJump();
          break;
      }
    });

    this.init();
  }

  init() {
    this.number = Number.MAX_SAFE_INTEGER;
    this.textResult.innerHTML = "";
    this.remainText.innerText = "";
    this.isGo = true;
    this.isJump = false;

    this.hidden(this.resumeButton);
    this.show(this.pauseButton);
  }

  showRemainTime() {
    this.remainText.innerText = `${this.delayMode} ${this.currentDelay}ms`;
  }

  async delayAction(data, func) {
    this.startTime = Date.now();
    if (this.delayMode === "PRE") {
      this.delayMode = "PRE";
      this.currentDelay = data.preDelay;
      if (data?.preDelay) {
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve();
            console.log("preDelay후 실행");
          }, data.preDelay)
        );
      }

      if (this.flag !== "FREEZE") {
        func();
      }
    }

    if (data?.afterDelay) {
      if (this.flag !== "FREEZE") {
        this.currentDelay = data.afterDelay;
        this.delayMode = "AFTER";
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve();
            console.log("afterDelay후 실행");
          }, data.afterDelay)
        );
      }
    }
  }

  async countUp() {
    console.log("countUp", this.delayMode);
    while (true) {
      if (this.flag === "FREEZE") break;
      if (this.number > datas.length) break;

      await this.delayAction(datas[this.number], () =>
        this.textResult.insertAdjacentText(
          "beforeend",
          `${datas[this.number].text}\n`
        )
      );

      console.log("couterAfter", this.delayMode);
      if (this.flag !== "FREEZE") {
        this.delayMode = "PRE";
        this.number += 1;
        console.log("couterAfter", this.delayMode);
      }
    }
  }

  start() {
    this.number = 0;
    this.countUp();
  }

  stop() {
    this.init();
  }

  pause() {
    this.pauseTime = Date.now();
    console.log(this.pauseTime, this.startTime);
    this.currentDelay = this.currentDelay - (this.pauseTime - this.startTime);

    this.showRemainTime();
    this.show(this.resumeButton);
    this.hidden(this.pauseButton);
  }

  resume() {
    this.countUp();

    this.show(this.pauseButton);
    this.hidden(this.resumeButton);
  }

  go() {
    this.isGo = true;
    this.countStop();

    this.show(this.pauseButton);
    this.hidden(this.resumeButton);
  }

  back() {
    this.isGo = false;

    this.show(this.pauseButton);
    this.hidden(this.resumeButton);
  }

  prevJump() {
    this.number -= 1;
    console.log("prevJump", this.number);
    this.isJump = true;
    if (this.flag !== "FREEZE") {
      this.preDelay(this.isGo);
    }

    this.remainText.innerText = "";
  }

  nextJump() {
    this.number += 1;
    console.log("nextJump", this.number);
    this.isJump = true;
    if (this.flag !== "FREEZE") {
      this.preDelay(this.isGo);
    }

    this.remainText.innerText = "";
  }

  end() {
    this.flag = "FREEZE";
  }

  show(el) {
    el.style.display = "block";
  }

  hidden(el) {
    el.style.display = "none";
  }
}

new Counter(datas);
