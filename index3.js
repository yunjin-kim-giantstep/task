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
          this.resume();
          this.flag = "RUN";
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
    this.isJump = false;

    this.hidden(this.resumeButton);
    this.show(this.pauseButton);
  }

  showRemainTime() {
    this.remainText.innerText = `${this.delayMode} ${this.currentDelay}ms`;
  }

  /**
   * @description param을 통해 text를 작성 유무 분기
   * @param {boolean} isNumberAdd
   */
  addCountText(isNumberAdd) {
    isNumberAdd
      ? this.texts.push(this.datas[this.number].text)
      : this.texts.pop();
    this.textResult.innerHTML = this.texts.map((v) => `<p>${v}</p>`).join("");
  }

  /**
   * @description 앞으로 카운트 진행 or 뒤로 카운트 진행
   * @param {boolean} isGo
   */
  preDelay(isGo) {
    this.delayMode = "PRE";
    this.currentDelay = this.datas[this.number]?.preDelay;
    this.startTime = Date.now();

    if (this.datas[this.number]?.preDelay === undefined) {
      if (this.countEnd()) return;
      if (isGo === true) {
        this.addCountText(isGo);
      }
      if (isGo === false) {
        this.number -= 1;
      }
      this.afterDelay.call(this, isGo);
      return;
    }

    function run() {
      if (isGo === true) {
        this.addCountText(isGo);
      }
      if (isGo === false) {
        this.number -= 1;
      }
      this.afterDelay.call(this, isGo);
    }

    this.timeouts.push(setTimeout(run.bind(this), datas[this.number].preDelay));
  }

  afterDelay(isGo) {
    this.delayMode = "AFTER";
    this.currentDelay = this.datas[this.number]?.afterDelay;
    this.startTime = Date.now();

    if (this.datas[this.number]?.afterDelay === undefined) {
      if (this.countEnd()) return;
      if (isGo === true) {
        this.number += 1;
      }
      if (isGo === false) {
        this.addCountText(isGo);
      }
      this.preDelay.call(this, isGo);
      return;
    }

    function run() {
      if (isGo === true) {
        this.number += 1;
      }
      if (isGo === false) {
        this.addCountText(isGo);
      }
      this.preDelay.call(this, isGo);
    }

    this.timeouts.push(
      setTimeout(run.bind(this), datas[this.number].afterDelay)
    );
  }

  remainCountUp(time, isGo) {
    function run() {
      isGo ? (this.number += 1) : (this.number -= 1);
      this.addCountText(isGo);
      if (this.delayMode === "PRE") {
        this.preDelay(isGo);
      }
      if (this.delayMode === "AFTER") {
        this.afterDelay(isGo);
      }
    }

    this.timeouts.push(setTimeout(run.bind(this), time));
  }

  countStop() {
    this.timeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    // this.timeouts = [];
  }

  countEnd() {
    if (this.datas.length === this.number) {
      this.end();
      this.number -= 1;
      return true;
    }
    if (this.number < 0) {
      this.end();
      this.number = 0;
      return true;
    }

    return false;
  }

  start() {
    this.preDelay.call(this, true);
  }

  stop() {
    this.init();
    this.countStop();
  }

  pause() {
    this.pauseTime = Date.now();
    this.currentDelay = this.currentDelay - (this.pauseTime - this.startTime);
    this.countStop();

    this.showRemainTime();
    this.show(this.resumeButton);
    this.hidden(this.pauseButton);
  }

  resume() {
    this.startTime = Date.now();
    if (this.isJump) {
      if (this.delayMode === "PRE") {
        this.preDelay(this.isGo);
      }
      if (this.delayMode === "AFTER") {
        this.afterDelay(this.isGo);
      }
      this.isJump = false;
    } else if (!this.isJump) {
      this.remainCountUp(this.currentDelay, this.isGo);
      this.isJump = false;
    }

    this.show(this.pauseButton);
    this.hidden(this.resumeButton);
  }

  go() {
    this.isGo = true;
    this.countStop();
    this.remainCountUp(this.currentDelay, true);

    this.show(this.pauseButton);
    this.hidden(this.resumeButton);
  }

  back() {
    this.isGo = false;
    this.countStop();
    this.remainCountUp(this.currentDelay, false);

    this.show(this.pauseButton);
    this.hidden(this.resumeButton);
  }

  prevJump() {
    this.countStop();
    this.number -= 1;
    this.addCountText(false);
    console.log("prevJump", this.number);
    this.isJump = true;
    if (this.flag !== "FREEZE") {
      this.preDelay(this.isGo);
    }

    this.remainText.innerText = "";
  }

  nextJump() {
    this.countStop();
    this.number += 1;
    this.addCountText(true);
    console.log("nextJump", this.number);
    this.isJump = true;
    if (this.flag !== "FREEZE") {
      this.preDelay(this.isGo);
    }

    this.remainText.innerText = "";
  }

  end() {
    this.countStop();
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
