
window.onload = function() {

    document.oncontextmenu = function (event) {
        event = event || window.event;
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    };
    
    let doc = document;
    let gamefield = doc.getElementById("gamefield");
    let levelSelect = doc.getElementById('level-select-form');
    let timerPause = doc.getElementById('timer-pause');
    let activeButton = doc.getElementById('level-easy'); 
    let timerTime = document.getElementById("clock");
    let div = doc.createElement('div');
    let scoreBoard = doc.getElementById('score-board');
    let gameName = doc.getElementById('game-name');
    let pauseButton = doc.getElementById('timer-pause');
    let gamefieldSize = 10;
    let arr;                        //gamefield array
    let randomArray;               //randomly generated array
    let t;
    let s = 0;
    let m = 0;
    let mineCount;
    let winCountdown;
    let isPlaying = false;
    let timerStart;

    let scoreObj = [{date:'no date', time:'00:00'},{date:'no date', time:'00:00'},{date:'no date', time:'00:00'}];
    if( !localStorage.getItem('scores0')){
        localStorage.setItem('scores0', JSON.stringify(scoreObj));
        localStorage.setItem('scores1', JSON.stringify(scoreObj));
        localStorage.setItem('scores2', JSON.stringify(scoreObj));
    }

   function newGame(){
        m = 0;
        s = 0
        showScores();
        clearTimeout(t);
        pauseButton.removeEventListener('click', hendlePause, false);
        gamefield.removeEventListener('contextmenu', hendleContextMenuClick, false);
        gamefield.addEventListener('click', hendleClick, false);
        isPlaying = false;
        timerTime.innerHTML = '00:00';
        gameName.innerHTML = 'Minesweeper game'
        randomArray = createArr(gamefieldSize);            
        arr =  createGameArr(randomArray);
        renderGameField();
        mineCount = countMines(arr);
        winCountdown = gamefieldSize*gamefieldSize - mineCount;
        timerStart = winCountdown;
   }

   function getNumberFromTime(arr){
            let strNum = arr.split(':');
            let num = Number(strNum[0]*60) + Number(strNum[1]);
        return num;
   }

   function getStoreName(){
        let rStorageName = '';
        if (gamefieldSize === 10) rStorageName = 'scores0';
        if (gamefieldSize === 12) rStorageName = 'scores1';
        if (gamefieldSize === 16) rStorageName = 'scores2';
        return rStorageName;
   }


   function setScores(){
        let storageName = getStoreName();
        let scores = JSON.parse(localStorage.getItem(storageName));
        let x = getNumberFromTime(timerTime.innerHTML);
        let y = getNumberFromTime(scores[0].time);
        if(x<y || y === 0){
             let date = new Date().toString().slice(4, 15);
             let time = timerTime.innerHTML;
             let newScores = [{date:date, time:time}, scores[0], scores[1]];
             localStorage.removeItem(storageName);
             localStorage.setItem(storageName, JSON.stringify(newScores));
        }
   }

   function showScores(){
        removeNodes(scoreBoard);
        let storageName = getStoreName();
        let li = doc.createElement('li');
        let scores = JSON.parse(localStorage.getItem(storageName));
        if(scores) {
            for(let i in scores) {
            if(scores[i].date !== 'no date'){
                let tmp = li.cloneNode(false);
                tmp.innerHTML = '<span class="scores-name">' + scores[i].date + '</span><span class="scores-time">' + scores[i].time + '</span>';
                scoreBoard.appendChild(tmp);
                }
            }      
        }
   }

   function hendlePause(){
        if(isPlaying) {
            gamefield.removeEventListener('click', hendleClick, false);
            gamefield.removeEventListener('contextmenu', hendleContextMenuClick, false);
            clearTimeout(t);
            isPlaying = !isPlaying;
        } else
        if(!isPlaying) {
            gamefield.addEventListener('click', hendleClick, false);
            gamefield.addEventListener('contextmenu', hendleContextMenuClick, false);
            gameClock();
            isPlaying = !isPlaying;
        }
   }

   function gameClock () {
        let time = timerTime.innerHTML;
            if (m == 59) {
                alert("Time Out");
                removeNodes(gamefield);
                newGame();
                return;
            }
        m = Number(m);
        s++;
        if(s > 59) {s = 0; m++}
        if (s < 10) s = "0" + s;
        if (m < 10) m = "0" + m;
        timerTime.innerHTML = m+":"+s;
        t = setTimeout(gameClock, 1000);
    }
   
   function markUnchecked(){
       for(let i in gamefield.childNodes){
           let node = gamefield.childNodes[i];
           if(node.id === 'box' && !node.checked) node.id = 'box2';
       }
   }

   function crutch(){
       let count = 0;
       for(let i in gamefield.childNodes){
           let k = gamefield.childNodes[i];
           if((k.id === 'box' || k.id === 'box2') && (!k.checked)) count ++;
       }
       console.log(count + 'count Crutch')
       if(count === mineCount) win();
   }

   function removeNodes(node){
        let range = document.createRange();
        range.selectNodeContents(node);
        range.deleteContents();
   }

   let hendleLevelClick =  function(e){
       if(isPlaying || (winCountdown < timerStart)) {
           let isNewGame = confirm('Play again?');
           if(isNewGame) 
            {
              isPlaying = false;
              newGame();
            } //else if(!isNewGame){};
       } else
       if(!isPlaying) {
            if(e.target.id === 'level-easy') gamefieldSize = 10; 
            else if (e.target.id === 'level-normal') gamefieldSize = 12;
            else if (e.target.id === 'level-hard') gamefieldSize = 16;
                activeButton = e.target;
                removeNodes(gamefield);
                newGame();
       }
   }

    levelSelect.addEventListener('click', hendleLevelClick, false);

    let hendleClick = function (e){

        if (e.which === 1 && e.target.id === 'box') {
            if (timerStart === winCountdown) gameClock();
            pauseButton.addEventListener('click', hendlePause, false);
            gamefield.addEventListener('contextmenu', hendleContextMenuClick, false);
            e.target.id = 'box1';
            isPlaying = true;
            e.target.innerHTML = arr[e.target.raw][e.target.cell];
            if (e.target.innerHTML === ' ') {
                pacman(e.target.raw, e.target.cell);
            } else 
            if(e.target.innerHTML === 'x') {
                e.target.className = 'mine boom';
                gameOver();
            } else colorMark(e.target);
    
        }   console.log(winCountdown);
            if (winCountdown <= 6) crutch();
            if (winCountdown === 0) win();
    }

    function hendleContextMenuClick(e){
       if (e.which === 3 && e.target.id === 'box' && !e.target.checked) {
           e.target.id = 'box2';
       } else  
       if (e.which === 3 && e.target.id === 'box2') {
           e.target.id = 'box';
       }
    }

    function win(){
        setScores();
        winCountdown = timerStart;
        pauseButton.removeEventListener('click', hendlePause, false);
        clearTimeout(t);
        gamefield.removeEventListener('contextmenu', hendleContextMenuClick, false);
        gameName.innerHTML = 'You won!!!'
        markUnchecked();
        isPlaying = false;
        activeButton.checked = null;
        showScores();
        packmanCount = 0;
   }

   function gameOver(){
        clearTimeout(t);
        winCountdown = timerStart;
        gamefield.removeEventListener('click', hendleClick, false);
        pauseButton.removeEventListener('click', hendlePause, false);
        gamefield.removeEventListener('contextmenu', hendleContextMenuClick, false);
        markBombs();
        gameName.innerHTML = 'Game over';
        isPlaying = false;
        activeButton.checked = null;
        packmanCount = 0;
   }

    function createArr(x) {
        let arr = new Array(x);
        for (let i = 0; i < x; i++){
            let tmpArr = new Array(x);
            for(let j = 0; j<x; j++) {
                let tmp = Math.random();
                    tmp < 0.87? tmp = 0 : tmp = "x";
                    tmpArr[j] = tmp;
                    arr[i] = tmpArr;
            }
        }
        return arr;
    }

    function createGameArr(x){

        let tmpArr = x;

        for (let i in tmpArr){
            for (let j in tmpArr[i]){
                if (tmpArr[i][j] === "x"){
                    let q=i;
                    let w=j;
                    w++;
                    if (tmpArr[q][w] !== 'x') {
                        let k = tmpArr[q][w];
                        k++;
                        tmpArr[q][w] = k;
                    }
                }
            }
        }

        for (let i in tmpArr){
            for (let j in tmpArr[i]){
                if (tmpArr[i][j] === "x"){
                    let q=i;
                    let w=j;
                    w--;
                    if (tmpArr[q][w] !== 'x') {
                        let k = tmpArr[q][w];
                        k++;
                        tmpArr[q][w] = k;
                    }
                }
            }
        }

        for (let i in tmpArr){
            for (let j in tmpArr[i]){
                if (tmpArr[i][j] === "x"){
                    let q=i;
                    let w=j;
                    if(q !=0) q--;
                        if (tmpArr[q][w] !== 'x') {
                        let k = tmpArr[q][w];
                        k++;
                        tmpArr[q][w] = k;
                    }
                }
            }
        }

        for (let i in tmpArr){
            for (let j in tmpArr[i]){
                if (tmpArr[i][j] === "x"){
                    let q=i;
                    let w=j;
                    if(q !=tmpArr.length-1) q++;
                        if (tmpArr[q][w] !== 'x') {
                        let k = tmpArr[q][w];
                        k++;
                        tmpArr[q][w] = k;
                    }
                }
            }
        }

        for (let i in tmpArr){
            for (let j in tmpArr[i]){
                if(i>0) {
                    if (tmpArr[i][j] === "x"){
                        let q=i;
                        let w=j;
                        w++;
                        q--;
                        if (tmpArr[q][w] !== 'x') {
                            let k = tmpArr[q][w];
                            k++;
                            tmpArr[q][w] = k;
                        }
                    }
                }
            }
        }

        for (let i in tmpArr){
            for (let j in tmpArr[i]){
                if(i<tmpArr.length-1) {
                    if (tmpArr[i][j] === "x"){
                        let q=i;
                        let w=j;
                        w--;
                        q++;
                        if (tmpArr[q][w] !== 'x') {
                            let k = tmpArr[q][w];
                            k++;
                            tmpArr[q][w] = k;
                        }
                    }
                }
            }
        }

        for (let i in tmpArr){
            for (let j in tmpArr[i]){
                if(i<tmpArr.length-1) {
                    if (tmpArr[i][j] === "x"){
                        let q=i;
                        let w=j;
                        w++;
                        q++;
                        if (tmpArr[q][w] !== 'x') {
                            let k = tmpArr[q][w];
                            k++;
                            tmpArr[q][w] = k;
                        }
                    }
                }
           }
        }

        for (let i in tmpArr){
            for (let j in tmpArr[i]){
                if(i>0) {
                    if (tmpArr[i][j] === "x"){
                        let q=i;
                        let w=j;
                        w--;
                        q--;
                        if (tmpArr[q][w] !== 'x') {
                            let k = tmpArr[q][w];
                            k++;
                            tmpArr[q][w] = k;
                        }
                    }
                }
            }
         }

         for (let i in tmpArr){
            for (let j in tmpArr[i]){
                if (tmpArr[i][j] === 0) {
                    tmpArr[i][j] = ' ';
                 }
            }
         }
    return tmpArr;
        //Jesus Christ
   }

   function countMines(arr){
       let count = 0;
        for(let i in arr) {
            for(let j in arr[i]) {
                if (arr[i][j] === 'x') count++
            }
        }
        return count;
   }

   function markBombs(){
       let tmpArr = [];
       for(let i in arr){
            for (let j in arr[i]) {
               if(arr[i][j] === 'x')
               {
                 let bb = [Number(i), Number(j)];
                 tmpArr.push(bb);
               }
            }
        }
      for(let m in gamefield.childNodes){
          let node = gamefield.childNodes[m];
          for(let j in tmpArr) {
              let k = tmpArr[j];
              if(node.raw === k[0] && node.cell === k[1] && node.className !== 'mine boom'){node.id = 'box'; node.className = 'mine';}
          }
       }
   }

   function renderGameField(){
       for (let i=0; i<arr.length; i++) {
       for (let j=0;j<arr.length; j++){
            let tmp = div.cloneNode(false);
            tmp.raw = i;
            tmp.cell = j;
            tmp.id = 'box';
            gamefield.appendChild(tmp);
       }
       let tmp1=div.cloneNode(false)
       gamefield.appendChild(tmp1);
    }
   }

   function reduceArray(forreducing){                           //2d Array filter and reducer
        let reduced = Object.keys(forreducing.reduce((p,c) => (p[c] = true,p),{}));
        let tmpArr = [];
            for(let i in reduced) {
                let tmp = [];
                let k = reduced[i].split(',');
                tmp = [Number(k[0]),Number(k[1])];
                tmpArr.push(tmp);
            }
            return tmpArr;
   }  

   let pacman = function(x,y){                                  //Eats free space *can be optimized*
    let tmpArr = scanBox(x,y);
    let checked = [];
    let ad = [];
    checked.push([x,y]); 

        for (let i = 0; i < 23; i++){
            let store = reduceArray(tmpArr);
            tmpArr = store;
        for(let i in tmpArr) {
            let djek = tmpArr[i];
            ex = djek[0];
            yt = djek[1];
            if(arr[ex][yt]=== ' ') {
                checked.push(djek);
                let z = scanBox(ex, yt);
                for(let u in z) ad.push(z[u]);
            }
        }
            for(let l in checked) ad.push(checked[l]);
            tmpArr = ad;
            ad=[];
    }
    let job = reduceArray(checked);

    let openArr = [];
    for(let i in job) {
        let chunk = job[i];
        let pu = scanBox(chunk[0], chunk[1]);
        for(let j in pu) openArr.push(pu[j]);
    }

    let bob = reduceArray(openArr);

        let nodesArr = [];
        for (let i in bob) {
            let chunk = bob[i];
            let n = chunk[0];
            let m = chunk[1];
                for (let j in gamefield.childNodes){
                    let k = gamefield.childNodes[j];
                    if(k.raw === n && k.cell === m && !k.checked) {
                        nodesArr.push(k);
                    }
                }
        }
          for (var i = 0; i < nodesArr.length; i++) {
            let k = nodesArr[i];
            for(let i in bob) {
                let s = bob[i];
                if(k.raw === s[0] && k.cell === s[1]) {
                    k.id = 'box1';
                    k.checked = 'checked';
                    k.innerHTML = arr[s[0]][s[1]];
                    colorMark(k);
                }
            }
          }
   }

   let scanBox = function(x, y) {                                       //Patterns for Pacman
        let tmpArr = [];
        let k = gamefieldSize-1;
        if(x === 0 && y === 0) tmpArr.push([x, y+1], [x+1, y], [x+1, y+1]);
        if(x === k && y === 0) tmpArr.push([x, y+1],[x-1, y], [x-1, y+1]);
        if(x === 0 && y === k) tmpArr.push([x,y-1],[x+1, y],[x+1, y-1]);
        if(x === k && y === k) tmpArr.push([x,y-1],[x-1,y],[x-1,y-1]);
        if(x === 0 && y>0 && y<k) tmpArr.push([x, y-1],[x, y+1],[x+1, y],[x+1, y-1], [x+1,y+1]);
        if(x === k && y>0 && y<k) tmpArr.push([x, y-1],[x,y+1],[x-1,y],[x-1,y-1],[x-1,y+1]);
        if(x>0 && x<k && y === 0) tmpArr.push([x,y+1],[x-1,y],[x-1,y+1],[x+1,y],[x+1,y+1]);
        if(x>0 && x<k && y === k) tmpArr.push([x,y-1],[x+1,y],[x+1,y-1],[x-1,y],[x-1,y-1]);
        if(x>0 && x<k && y>0 && y<k) tmpArr.push([x,y-1],[x,y+1],[x-1,y-1],[x-1,y],[x-1,y+1],[x+1,y-1],[x+1,y],[x+1,y+1]);

        return tmpArr;
    }

    let colorMark = function(k) {
        if(k.innerHTML === '1') { 
                k.className = 'box-near1';
        } else
        if(k.innerHTML === '2') {
                k.className = 'box-near2';
        } else
        if(k.innerHTML === '3') {
                k.className = 'box-near3';
        } else
        if(k.innerHTML === '4') {
                k.className = 'box-near4';
        } else {
                k.className = 'box-near-alot';}
        k.checked = 'checked';
        winCountdown -- ;
   }

   newGame();
}