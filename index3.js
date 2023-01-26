import { datas } from "./constant.js";

class Counter {
  constructor(datas) {
    this.startButton = document.getElementById("start");
    this.stopButton = document.getElementById("stop");
    this.pauseButton = document.getElementById("pause");
    this.resumeButton = document.getElementById("resume");
    this.prevJumpButton = document.getElementById("prev-jump");
    this.nextJumpButton = document.getElementById("next-jump");
    this.goButton = document.getElementById("go");
    this.backButton = document.getElementById("back");
    this.addButton = document.getElementById("add-delay");
    this.textResult = document.getElementById("text-result");
    this.remainText = document.getElementById("text-remain");
    this.addDelayText = document.getElementById("text-add-delay");
    this.buttonArea = document.getElementById("button-area");

    this.datas = datas;

    this.number = 0;
    this.startTime = 0;
    this.pauseTime = 0;
    this.currentDelay = this.datas[this.number]?.preDelay;
    this.timeouts = [];
    this.texts = [];
    this.isGo = true;
    this.flag = "BEFORE"; // RUN, FREEZE
    this.delayMode = "PRE"; // AFTER

    this.buttonArea.addEventListener("click", (e) => {
      switch (e.target.id) {
        case "start":
          if (this.flag !== "BEFORE") return;
          this.start();
          this.changeFlag("RUN");
          break;
        case "stop":
          this.stop();
          this.changeFlag("BEFORE");
          break;
        case "pause":
          if (this.flag !== "RUN") return;
          this.pause();
          this.changeFlag("FREEZE");
          break;
        case "resume":
          if (this.flag !== "FREEZE") return;
          this.resume();
          this.changeFlag("RUN");
          break;
        case "go":
          this.go();
          this.changeFlag("RUN");
          break;
        case "back":
          this.back();
          this.changeFlag("RUN");
          break;
        case "prev-jump":
          this.prevJump();
          break;
        case "next-jump":
          this.nextJump();
          break;
        case "add-delay":
          this.addDelay();
          break;
      }
    });

    this.init();
  }

  init() {
    this.changeNumber(0);
    this.textResult.innerHTML = "";
    this.hideRemainText();
    this.changeIsGo(true);

    this.hidden(this.resumeButton);
    this.show(this.pauseButton);
  }

  addCountText(isNumberAdd) {
    isNumberAdd
      ? this.texts.push(this.datas[this.number].text)
      : this.texts.splice(this.number, this.texts.length);
    this.textResult.innerHTML = this.texts
      .map((v, i) => `<p>index:${i}, text:${v}</p>`)
      .join("");
  }

  preDelay(isGo) {
    this.changeDelayMode("PRE");
    this.currentDelay = this.datas[this.number]?.preDelay;
    this.startTime = Date.now();

    function run() {
      isGo ? this.addCountText(isGo) : this.changeNumber(-1);
      return this.afterDelay.call(this, isGo);
    }

    if (this.datas[this.number]?.preDelay === undefined) {
      if (this.countEnd()) return;
      run.call(this);
      return;
    }

    this.timeouts.push(setTimeout(run.bind(this), datas[this.number].preDelay));
  }

  afterDelay(isGo) {
    this.changeDelayMode("AFTER");
    this.currentDelay = this.datas[this.number]?.afterDelay;
    this.startTime = Date.now();

    function run() {
      isGo ? this.changeNumber(1) : this.addCountText(isGo);
      this.preDelay.call(this, isGo);
    }

    if (this.datas[this.number + 1]?.preDelay === undefined) {
      return;
    }

    if (this.datas[this.number]?.afterDelay === undefined) {
      if (this.countEnd()) return;
      run.call(this);
      return;
    }

    this.timeouts.push(
      setTimeout(run.bind(this), datas[this.number].afterDelay)
    );
  }

  remainCountUp(time, isGo) {
    function run() {
      if (this.delayMode === "PRE") {
        isGo ? this.addCountText(isGo) : this.changeNumber(-1);
        this.afterDelay(isGo);
      } else if (this.delayMode === "AFTER") {
        isGo ? this.changeNumber(1) : this.addCountText(isGo);
        this.preDelay(isGo);
      }
    }

    this.timeouts.push(setTimeout(run.bind(this), time));
  }

  countStop() {
    this.timeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.timeouts = [];
  }

  countEnd() {
    if (this.datas.length === this.number + 1) {
      this.end();
      return true;
    }
    if (this.number < 0) {
      this.end();
      this.changeNumber(0);
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
    this.remainCountUp(this.currentDelay, this.isGo);

    this.show(this.pauseButton);
    this.hidden(this.resumeButton);
  }

  go() {
    this.changeIsGo(true);
    this.countStop();
    this.remainCountUp(this.currentDelay, true);

    this.show(this.pauseButton);
    this.hidden(this.resumeButton);
  }

  back() {
    this.changeIsGo(false);
    this.countStop();
    this.remainCountUp(this.currentDelay, false);

    this.show(this.pauseButton);
    this.hidden(this.resumeButton);
  }

  prevJump() {
    this.countStop();
    this.changeNumber(-1);
    this.changeDelayMode("PRE");
    this.addCountText(false);
    this.hideRemainText();
    if (this.flag !== "FREEZE") {
      this.preDelay(this.isGo);
    }
  }

  nextJump() {
    this.countStop();
    this.delayMode === "PRE" ? this.addCountText(true) : "";
    this.changeDelayMode("PRE");
    this.changeNumber(1);
    this.hideRemainText();
    if (this.flag !== "FREEZE") {
      this.preDelay(this.isGo);
    }
  }

  addDelay() {
    if (this.datas.length === this.number + 1) {
      const random = this.datas[Math.floor(Math.random() * this.datas.length)];
      datas.push(random);
      this.changeFlag("RUN");
      this.changeNumber(1);
      this.start();
      return (this.addDelayText.innerText = JSON.stringify(random));
    }
    const random = this.datas[Math.floor(Math.random() * this.datas.length)];
    datas.push(random);

    this.addDelayText.innerText = JSON.stringify(random);
  }

  end() {
    this.countStop();
    this.changeFlag("BEFORE");
  }

  show(el) {
    el.style.display = "block";
  }

  hidden(el) {
    el.style.display = "none";
  }

  hideRemainText() {
    this.remainText.innerText = "";
  }

  showRemainTime() {
    this.remainText.innerText = `${this.delayMode} ${this.currentDelay}ms`;
  }

  changeNumber(number) {
    if (number === 0) return (this.number = 0);
    this.number += number;
    if (this.number < 0) this.number = 0;
  }

  changeDelayMode(mode) {
    this.delayMode = mode;
  }

  changeFlag(flag) {
    this.flag = flag;
  }

  changeIsGo(boolean) {
    this.isGo = boolean;
  }
}

new Counter(datas);
