
class Counter {
	constructor() {
	  this.startButton = document.getElementById('start');
	  this.stopButton = document.getElementById('stop');
	  this.pauseButton = document.getElementById('pause');
	  this.resumeButton = document.getElementById('resume');
	  this.textResult = document.getElementById('text-result');
	  this.buttonArea = document.getElementById('button-area');
  
	  this.number = 0;
	  this.delay = 1000;
	  this.counting = null;
  
	  this.buttonArea.addEventListener('click', (e) => {
		switch (e.target.id) {
		  case 'start':
			this.start();
			break;
		  case 'stop':
			this.stop();
			break;
		  case 'pause':
			this.pause();
			break;
		  case 'resume':
			this.resume();
			break;
		}
	  });
  
	  this.init();
	}
  
	init() {
	  this.number = 0;
	  this.textResult.value = '';
	  this.counting = null;
	  this.hidden(this.resumeButton);
	  this.show(this.pauseButton);
	}
  
	countStart() {
	  this.counting = setInterval(() => {
		this.textResult.value += `\n${(this.number += 1)}`;
	  }, this.delay);
	}
  
	countStop() {
	  clearInterval(this.counting);
	}
  
	start() {
	  if (this.counting === null) {
			this.countStart();
	  }
	}
  
	stop() {
	  this.countStop();
	  this.init();
	}
  
	pause() {
	  if (this.counting === null) return;
	  this.countStop();
	  this.show(this.resumeButton);
	  this.hidden(this.pauseButton);
	}
  
	resume() {
	  this.countStart();
	  this.show(this.pauseButton);
	  this.hidden(this.resumeButton);
	}
  
	show(el) {
	  el.style.display = 'block';
	}
  
	hidden(el) {
	  el.style.display = 'none';
	}
  }
  
  new Counter();
  