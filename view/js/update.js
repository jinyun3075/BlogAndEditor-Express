function parseMd(md){
    //ul
    md = md.replace(/^\s*\n\*/gm, '<ul>\n*');
    md = md.replace(/^(\*.+)\s*\n([^\*])/gm, '$1\n</ul>\n\n$2');
    md = md.replace(/^\*(.+)/gm, '<li>$1</li>');
    
    //ol
    md = md.replace(/^\s*\n\d\./gm, '<ol>\n1.');
    md = md.replace(/^(\d\..+)\s*\n([^\d\.])/gm, '$1\n</ol>\n\n$2');
    md = md.replace(/^\d\.(.+)/gm, '<li>$1</li>');
    
    //blockquote
    md = md.replace(/^\>(.+)/gm, '<blockquote>$1</blockquote>');
    
    //h
    md = md.replace(/[\#]{6}(.+)/g, '<h6>$1</h6>');
    md = md.replace(/[\#]{5}(.+)/g, '<h5>$1</h5>');
    md = md.replace(/[\#]{4}(.+)/g, '<h4>$1</h4>');
    md = md.replace(/[\#]{3}(.+)/g, '<h3>$1</h3>');
    md = md.replace(/[\#]{2}(.+)/g, '<h2>$1</h2>');
    md = md.replace(/[\#]{1}(.+)/g, '<h1>$1</h1>');
    
    //alt h
    md = md.replace(/^(.+)\n\=+/gm, '<h1>$1</h1>');
    md = md.replace(/^(.+)\n\-+/gm, '<h2>$1</h2>');
    
    //images
    md = md.replace(/\!\[([^\]]+)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />');
    
    //links
    md = md.replace(/[\[]{1}([^\]]+)[\]]{1}[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, '<a href="$2" title="$4">$1</a>');
    
    //font styles
    md = md.replace(/[\*\_]{2}([^\*\_]+)[\*\_]{2}/g, '<b>$1</b>');
    md = md.replace(/[\*\_]{1}([^\*\_]+)[\*\_]{1}/g, '<i>$1</i>');
    md = md.replace(/[\~]{2}([^\~]+)[\~]{2}/g, '<del>$1</del>');
    
    //pre
    md = md.replace(/^\s*\n\`\`\`(([^\s]+))?/gm, '<pre class="$2">');
    md = md.replace(/^\`\`\`\s*\n/gm, '</pre>\n\n');
    
    //code
    md = md.replace(/[\`]{1}([^\`]+)[\`]{1}/g, '<code>$1</code>');
    
    //p
    md = md.replace(/^\s*(\n)?(.+)/gm, function(m){
        return  /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>'+m+'</p>';
    });
    
    //strip p from pre
    md = md.replace(/(\<pre.+\>)\s*\n\<p\>(.+)\<\/p\>/gm, '$1$2');
    
    return md;
}
const url = "http://localhost:8080/";
const $view =document.querySelector('#container');
const getlist = async ()=>{
    const res = await fetch(url+"post/api/"+sessionStorage.getItem('id'),{
        headers: {
            "Content-Type":"application/json"
        }
    })
    const json = await res.json();
    $view.innerHTML = `
    <div class="sub">
    <p id="category-title" class="sub_text">게시물 만들기</p>
    <p class="sub_count"></p>
    </div>
    <div class='form'>    
        <input class="form_input" type="text" value="${json.title}" placeholder="제목을 입력해주세요.">
    </div>

    <div class="form-check form-switch" id="mark">
        <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked">
        <label class="form-check-label" for="flexSwitchCheckChecked">markDown</label>
    </div>
    <section class="editor">
        <p class="text">text</p>
        <div class="inptxt" contenteditable>${json.content}</div>
        <p class="viewer">viewer</p>
        <div class="showmd">${json.viewer}</div>
    </section>
    <button type="button" class="create">update</button>
    <button type="button" class="main">뒤로가기</button>
    <label for="form_btn" class="form_btn">img</label>
    <input type="file" id="form_btn">
    `
const $check = document.querySelector('#flexSwitchCheckChecked');
const $title = document.querySelector('.form_input');
const $txt = document.querySelector('.inptxt');
const $show = document.querySelector('.showmd');
const $imgfile =document.querySelector('#form_btn');
const $create = document.querySelector('.create');
const $back =  document.querySelector('.main');
$back.onclick = ()=> {
    location.href = "index.html"
}
let check = false;

$check.onclick = (e) => {
    check = e.target.checked;
}
$txt.addEventListener('keyup',()=> {
    mdchange();
})
const mdchange = ()=> {
    $show.innerHTML = (check?parseMd($txt.textContent):$txt.textContent);
}
let image=[];
$imgfile.addEventListener('change',function(e){
    const f1 = e.target.files[0];
    image.push(f1);
})
let titleImg=[];
async function imgupload(img) {
    const formdata = new FormData();
    formdata.append('image',img[0]);
    const res = await fetch(url+'img/upload',{
        method : "post",
        body: formdata
    })
    const json = await res.json();
    titleImg.push(json["destination"].split('/')[1]);
    titleImg.push(json["filename"]);
}
$create.onclick = async ()=>{
        if(image.length>0){
            await imgupload(image);
        }
        const title = $title.value;
        const content = $txt.textContent;
        const viewer = $show.innerHTML;
        await fetch(url+"post/api/"+sessionStorage.getItem('id'),{
            method:'put',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                content,
                viewer,
                section:"",
                titleImg
            })
        }).then((data)=>{
            location.href = 'index.html';
        }).catch((error)=>{
            location.href = 'index.html';
        })
}
}
getlist();