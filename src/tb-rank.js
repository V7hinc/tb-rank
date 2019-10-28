

// ==UserScript==
// @name                Get Rank in Taobao
// @name:zh-CN          Get Rank in Taobao
// @description         Get Rank in Taobao

// @author              lib
// @namespace           https://lib.org
// @homepageURL         https://lib.org/tb-rank
// @supportURL          https://github.com/ace1573/tb-rank
// @license             GPL-3.0

// @include             /^https?://s.taobao.com/search\?.+/
// @include             /^https?://list.tmall.com/search_product.htm\?.+/
// @grant               none
// @run-at              document-idle

// @date                28/10/2019
// @modified            28/10/2019
// @version             0.0.1
// ==/UserScript==


! function() {
  "use strict";

  var href = location.search;

  // '#mainsrp-itemlist .pic-box-inner .pic a'


  document.body.insertAdjacentHTML('beforeend', `
  
  <div style="position: fixed; background:#FFF; border:1px solid #EFEFEF; padding: 20px; top: 10%; right: 5%;">
    <textarea id="_rnk_products" rows="5" cols="30" placeholder="id name" value="564877445605 私家云"></textarea>
    <br>
    <button id="_rnk_start" style="padding: .2em 2em;">start</button>
    <br><br>
    <div id="_rnk_result" style="font-size: 1.2em; font-weight: bold; color: red;"></div>
  </div>
  `);
  
  //点击事件
  document.getElementById('_rnk_start').onclick = ()=>{
    getRanks().then()
  }

  
}();


async function getCurrPage(){

  while(!document.querySelector('.m-page li.active span.num')){
    await _sleep(100)
  }

  let node = document.querySelector('.m-page li.active span.num')
  let page = node.innerHTML
  console.log('curr page', page)
  return parseInt(page)
}
function getDatas(){//取初始化数据
  if(window.__rnk_datas) return window.__rnk_datas

  //初始化
  let result = window.__rnk_datas = { products: {}, ranks: {} }
  result.products = getProductFromInput()
  return result
}
function getProductFromInput(){
  let products = {}
  try {
    let _rnk_products = document.getElementById('_rnk_products').value
    for(let item of _rnk_products.split('\n')){
      let arr = item.split(/\s+/g)
      products[arr[0].trim()] = arr[1].trim()
    }
  } catch (error) {
    alert(`输入格式错误`)
    throw error
  }
  return products
}


//.m-page li.active span.num //当前页
//.m-page li.next a 下一页


async function getRanks(){
  let currPage = await getCurrPage()

  //产品
  let { products, ranks } = getDatas()

  console.log(`products`, products)

  let list = document.querySelectorAll('#mainsrp-itemlist .pic-box-inner .pic a')
  
  let invalidCount = 0//无用的
  for(let i=0; i<list.length; i++){
    let item = list[i]
    if(!item.href){
      invalidCount++
      continue
    }
    let id = _getUrlParam('id', item.href)
    if(!id){
      invalidCount++
      continue
    }
    if(products[id]){
      ranks[id] = (i + 1 - invalidCount)
    }
  }

  
  let result = [], findCount = 0
  for(let key in ranks){
    result.push(`${products[key]}: 第${currPage}页 第${ranks[key]}条`)
    findCount++
  }
  
  let nextPageNode = document.querySelector('.m-page li.next a')
  if(findCount == products.length || currPage > 10 || !nextPageNode){
    document.getElementById('_rnk_result').innerHTML = result.join('\n')
    alert('搜索完毕 查看--->')
  }else{//保存起来
    console.log('curr result', result)
    console.log('to next page')
    nextPageNode.click()//下一页

    await _sleep(500)
    await getRanks()
  }
}


function _sleep(mills){
  return new Promise((resolve,reject)=>{
    setTimeout(resolve, mills)
  })
}

function _getUrlParam(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}