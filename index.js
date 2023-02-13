//设置样式
function setStyle(d,styleObject){
    for(const key in styleObject){
        d["style"][key] = styleObject[key];
    }
    d["style"]["transition"] = ".225s";
}
//生成随机的坐标
function randomPosition(min,max){
    return randomKey(min,max);
} 
//生成随机的数字
function randomKey(min,max){
    return parseInt(Math.random()*(max-min+1)+min);
}
//打乱数组
function randomSort(a,b){
    return Math.random() > 0.5 ? -1 : 1;
}

const app = document.querySelector('#app');
const $width = 50;
const $height = 50;
const blocks = 3;
const allBlock = [];
const IMAGS = [
    './img/1.jpg',
    './img/2.jpg',
    './img/3.jpg',
    './img/4.jpg',
    './img/5.jpg',
    './img/6.jpg',
    './img/7.jpg',
]
let gameOver = false;
function calPosition(){
    const {x,y} = app.getBoundingClientRect();
    
    const AppPosition={
        x,
        y,
        startX:20,
        startY:20,
        endX:app.offsetWidth-70,
        endY:app.offsetHeight-200,
    }
    return AppPosition;
}
const AppPosition = calPosition();
const hasBlockArr = [];
var storageBoxPosition;
var startLeft;
function computedBoxPosition(target,targetDomClass){
    setStyle(target,{
        zIndex:9999
    })
    const Item = {target,targetDomClass};
    storageBoxPosition = storageBox.getBoundingClientRect();
    startLeft = storageBoxPosition.x-AppPosition.x+10;
    const top = storageBoxPosition.y-AppPosition.y+10+'px';
    if(!hasBlockArr.length){
        setStyle(target,{
            left:startLeft+'px',
            top
        })
        targetDomClass.left = startLeft
        hasBlockArr.push(Item);
    }else{
        const hasIndex =  hasBlockArr.findIndex((v)=>{
            return v.targetDomClass.n == targetDomClass.n;
        });
        if(hasIndex === -1){
            const left = startLeft + hasBlockArr.length*targetDomClass.$width;
            setStyle(target,{
                left:left+'px',
                top
            });
            targetDomClass.left = left;
            hasBlockArr.push(Item);
        }else{
            for(let index = hasBlockArr.length - 1; index >= hasIndex; index--){
                const newLeft =  startLeft+(index+1)*$width;
                setStyle(hasBlockArr[index].target,{
                    left:newLeft+'px',
                })
                hasBlockArr[index].targetDomClass.left = newLeft;
            }
            setStyle(target,{
                left:startLeft+hasIndex*targetDomClass.$width+'px',
                top
            })
            targetDomClass.left = startLeft+hasIndex*targetDomClass.$width+'px';
            hasBlockArr.splice(hasIndex,0,Item);
        }
    }
    Item.target.classList.remove("noSelect"); //没有被选中，删除
    Item.target.classList.add("isSelect"); //添加，表示被选中的
    const removeIndex = allBlock.findIndex((v) => {
      return v.index === Item.targetDomClass.index;
    });
    // 删除allBock中的对应的对象
    allBlock.splice(removeIndex, 1);
    // 暴力高亮，重新渲染
    const noSelect = document.querySelectorAll(".noSelect");
    // 全部删除剩余所有的元素
    for (let i = 0; i < noSelect.length; i++) {
      app.removeChild(noSelect[i]);
    }
    // 重新渲染
    allBlock.forEach((item) => {
      app.appendChild(item.draw());
    }); 
}
function GameState(){
    if(hasBlockArr.length===7){
        alert("不好意思，你输了，你真菜");
        gameOver = true;
    }
    if(allBlock.length ===0&&hasBlockArr.length===0){
        alert("你赢了，真厉害");
        gameOver = true;
    }
    if(gameOver){
        window.location.reload(false);
    }
}
function checkBox() {
    const checkMap = {}; //用来接受收集盒中的相同的图片的数据
    hasBlockArr.forEach((item, index) => {
      if (!checkMap[item.targetDomClass.n]) {
        checkMap[item.targetDomClass.n] = [];
      }
      checkMap[item.targetDomClass.n].push({
        index: index,
        id: item.targetDomClass.index,
      });
      // console.log(checkMap);
      for (const key in checkMap) {
        if (checkMap[key].length === 3) {
          // console.log('可以删除');
          //删除数组中的相同的三个元素
          hasBlockArr.splice(checkMap[key][0].index, 3);
          // 同时删除页面的dom
          setTimeout(() => {
            checkMap[key].forEach((item) => {
              var box = document.getElementById(item.id);
              box.parentNode.removeChild(box);
            });
            // 改变页面其他的dom元素的位置
            hasBlockArr.forEach((item, index) => {
              let left = startLeft + index * item.targetDomClass.$width + "px";
              setStyle(item.target, {
                left,
              });
              item.targetDomClass.left = left;
            });
          }, 300);
        }
      }
      
    });
    setTimeout(()=>{
        GameState();
      },500)
}

function clickBlock(target,targetDomClass){
    if(targetDomClass.blockState){
        computedBoxPosition(target,targetDomClass);
        checkBox();
    }
    
}

class Block{
    constructor(src,i){
        this.$width = $width;
        this.$height = $height;
        this.src = src;
        this.index = i;
        this.n = src;
        this.blockState = false;
        this.x  = randomPosition(AppPosition.startX,AppPosition.endX);
        this.y  = randomPosition(AppPosition.startY,AppPosition.endY);
    }
    //判断是否被遮挡
    isCover(){
        var thisBlock;
        var coverState = false;
        for(let i = 0; i < allBlock.length; i ++){
            if(allBlock[i].index === this.index){
                thisBlock = allBlock[i];
            }else if(thisBlock){
                const target = allBlock[i];
               var xLeft = target.x;
               var xRight = target.x + target.$width;
               var yTop = target.y;
               var yBottom = target.y + target.$height;
               if(!(thisBlock.x > xRight || thisBlock.x + thisBlock.$width < xLeft||
                    thisBlock.y > yBottom|| thisBlock.y + thisBlock.$height < yTop
                )){
                   
                    coverState = true;
                    break;
                }
            }
        }
        return coverState;
    }
    draw(){
        const img = new Image();
        img.src = this.src;
        img.id = this.index;
        img.classList = 'noSelect imgGlobal';
        img.onclick = clickBlock.bind(null,img,this);
        let style = {
            width:this.$width+'px',
            height:this.$height+'px',
            left:this.x+'px',
            top:this.y+'px',
        }
        if(this.isCover()){
            img.classList.add('imgFilter');
            this.blockState = false;
        } else{
            img.classList.remove('imgFilter');
            this.blockState = true;
        }
        setStyle(img,style);
        return img;
    }
}

function drawBlock(group){
    let virtualArr = [];
    for(let i = 0; i < group; i ++)
    {
        virtualArr.push(...IMAGS.sort(randomSort));
    }
    virtualArr.forEach((item,index)=>{
        const vblock = new Block(item,index);
        allBlock.push(vblock);
    })
    allBlock.forEach(item =>{
        app.appendChild(item.draw());
    })
}
const storageBox = document.getElementById('storageBox')
window.onload=()=>{
    drawBlock(blocks);
    setStyle(storageBox,{
        border:'10px solid blue',
    })
}


