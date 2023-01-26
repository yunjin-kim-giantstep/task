import { datas } from "./constant.js";

const flatDatas = datas
  .flatMap((v) => Object.entries(v))
  .map(([k, v]) => {
    let obj = {};
    obj[k] = v;
    return obj;
  });

class Counter {
  constructor() {
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

    this.datas = flatDatas;

    this.number = 0;
    this.flag = "BEFORE"; // RUN, FREEZE
    this.startTime = 0;
    this.pauseTime = 0;
    this.currentDelay = this.datas[this.number]?.preDelay;
    this.isGo = true;
    this.delayMode = "PRE"; // AFTER
    this.timers = [];

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
          this.flag = "FREEZE";
          this.pause();
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
    this.number = 0;
    this.textResult.innerHTML = "";
    this.remainText.innerText = "";
    this.isGo = true;

    this.hidden(this.resumeButton);
    this.show(this.pauseButton);
  }

  showRemainTime() {
    this.remainText.innerText = `delayTime: ${this.currentDelay}ms`;
  }

  async delayAction(data, func) {
    console.log("delayAction", this.timers);

    if (data["text"]) {
      return func();
    }

    this.startTime = Date.now();

    await new Promise((resolve) =>
      this.timers.push(
        setTimeout(() => {
          resolve();
          this.isGo ? (this.number += 1) : (this.number -= 1);
          if (this.datas[this.number]["preDelay"]) {
            this.currentDelay = this.datas[this.number]?.preDelay;
          }
          if (this.datas[this.number]["afterDelay"]) {
            this.currentDelay = this.datas[this.number]?.afterDelay;
          }
          console.log("zzzz", this);
          this.countUp();
        }, this.currentDelay)
      )
    );
  }

  async countUp() {
    // while (true) {
    // 재귀함수로 하는건 어떠한가?
    if (this.flag === "FREEZE") return;
    if (this.number > this.datas.length) return;

    await this.delayAction(this.datas[this.number], () =>
      this.textResult.insertAdjacentText(
        "beforeend",
        `${this.datas[this.number].text}\n`
      )
    );

    console.log("countUp number", this.number);

    // this.isGo ? (this.number += 1) : (this.number -= 1);
    // if (this.datas[this.number]["preDelay"]) {
    //   this.currentDelay = this.datas[this.number]?.preDelay;
    // }
    // if (this.datas[this.number]["afterDelay"]) {
    //   this.currentDelay = this.datas[this.number]?.afterDelay;
    // }

    // await this.countUp();
    // }
  }

  start() {
    this.countUp();
  }

  stop() {
    this.init();
  }

  pause() {
    this.pauseTime = Date.now();
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

  prevJump() {
    if (this.number === 0) return;

    while (true) {
      this.number -= 1;
      if (flatDatas[this.number].text) {
        this.textResult.insertAdjacentText(
          "beforeend",
          `${flatDatas[this.number].text}\n`
        );
        break;
      }
    }

    this.remainText.innerText = "";
  }

  nextJump() {
    if (this.number > this.datas.length) return;

    while (true) {
      this.number += 1;
      if (flatDatas[this.number].text) {
        this.textResult.insertAdjacentText(
          "beforeend",
          `${flatDatas[this.number].text}\n`
        );
        this.number += 1;
        break;
      }
    }

    this.remainText.innerText = "";
  }

  go() {
    this.isGo = true;

    this.show(this.pauseButton);
    this.hidden(this.resumeButton);
  }

  back() {
    this.isGo = false;

    this.show(this.pauseButton);
    this.hidden(this.resumeButton);
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

new Counter();
