function MarkdownDoc() {
    //shortcut to DOM elements
    this.loginBtn = document.getElementById("loginBtn");
    this.userInfo = document.getElementById("userInfo");
    this.userPhoto = document.getElementById("userPhoto");
    this.userName = document.getElementById("userName");
    this.logoutBtn = document.getElementById("logoutBtn");
    this.menuSection = document.getElementById("menuSection");
    this.docSection = document.getElementById("docSection");
    
    //Menu Edit Tool
    this.menuEditTool = document.getElementById("menuEditTool");
    this.documentList = document.getElementById("documentList");
    this.menuSaveBtn = document.getElementById("menuSaveBtn");
    this.menuCancelBtn = document.getElementById("menuCancelBtn");
    this.menuContainer = document.getElementById("menuContainer");
    
    //Document Edit Tool
    this.editTool = document.getElementById("editTool");
    
    //Present Section Element
    this.presentSection = document.getElementById("presentSection");
    this.view = document.getElementById("view");
    this.markdownEditor = document.getElementById("markdownEditor");
    this.preview = document.getElementById("preview");
    
    //Option Tools
    this.optionBG = document.getElementById("optionBG");
    this.optionPanel = document.getElementById("optionPanel");
    this.folderBtn = document.getElementById("folderBtn");
    this.fileBtn = document.getElementById("fileBtn");
    this.renameBtn = document.getElementById("renameBtn");
    this.deleteBtn = document.getElementById("deleteBtn");
    
    //Others
    //this.menuLoading = document.getElementById("menuLoading");
    
    //Variable Object
    //this.dataObj;
    this.realModel;
    this.viewModel;
    this.onMenuEditState = false;
    this.targetElement;
    
    //event binding
    this.loginBtn.addEventListener("click", this.login.bind(this));
    this.logoutBtn.addEventListener("click", this.logout.bind(this));
    
    this.editTool.addEventListener("click", this.switchPage.bind(this));
    this.menuSaveBtn.addEventListener("click", this.submitMenuList.bind(this));
    this.menuCancelBtn.addEventListener("click", this.revertMenuList.bind(this));
    
    this.menuSection.addEventListener("click", this.handleMenuEvent.bind(this));
    this.menuSection.addEventListener("contextmenu", this.handleOptionEvent.bind(this));
    
    this.optionBG.addEventListener("click", this.closeOptionPanel.bind(this));
    this.folderBtn.addEventListener("click", this.addFolder.bind(this));
    this.fileBtn.addEventListener("click", this.addFile.bind(this));
    this.renameBtn.addEventListener("click", this.renameFile.bind(this));
    this.deleteBtn.addEventListener("click", this.deleteFile.bind(this));
    
    //initialize firebase
    this.initFirebase();
}

MarkdownDoc.prototype.initFirebase = function() {
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this)); 
}

MarkdownDoc.prototype.login = function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithPopup(provider);
}

MarkdownDoc.prototype.logout = function() {
    this.auth.signOut();
    this.menuSection.removeChild(this.menuSection.childNodes[0]);
}

MarkdownDoc.prototype.onAuthStateChanged = function(user) {
    //console.info(event);
    if (user) {
        var profilePicUrl = user.photoURL;
        var userName = user.displayName;
        this.userPhoto.style.backgroundImage = "url('" + (profilePicUrl || "/images/profile_placeholder.png") + "')";
        this.userName.textContent = userName;
        
        this.loginBtn.classList.add("hide");
        this.userInfo.classList.remove("hide");
        
        this.loadDoc();
    } else {
        this.loginBtn.classList.remove("hide");
        this.userInfo.classList.add("hide");
        
    }
}

/* ====== Load Document ====== */
MarkdownDoc.prototype.loadDoc = function() {
    this.menuRef = this.database.ref("doc");
    this.menuRef.once("value")
        .then(function(data){
            //console.log(data.val());
            this.displayMenu(data.val());
            this.menuContainer.querySelector("P").click();
            this.menuContainer.querySelector("LI").click();
        }.bind(this)).catch(function(error){
            console.error("error:", error);
        });
        
}

MarkdownDoc.prototype.displayMenu = function(dataObj) {
    console.log(dataObj);
    var menuContainer;
    var listTitle;
    var menuList;
    var listItem;
    var key;
    var item;
    var firstElement;
    var firstItem;
    
    this.realModel = JSON.parse(JSON.stringify(dataObj));
    this.viewModel = JSON.parse(JSON.stringify(dataObj));
    
    /*menuContainer = document.createElement("DIV");
    menuContainer.classList.add("menuContainer");*/
    //this.menuLoading.classList.add("hide");
    
    this.menuContainer.innerHTML = "";
    
    for (key in dataObj) {
        listTitle = document.createElement("P");
        listTitle.textContent =  dataObj[key].bookname;
        menuList = document.createElement("UL");
        menuList.setAttribute("key", key);
        for (item in dataObj[key]) {
            if (item !== "bookname") {
                listItem = document.createElement("LI");
                listItem.setAttribute("item", item);
                listItem.textContent = dataObj[key][item].paperName;
                menuList.appendChild(listItem);
            }
        }
        this.menuContainer.appendChild(listTitle);
        this.menuContainer.appendChild(menuList);
    }
    /* add image folder */
    listTitle = document.createElement("P");
    listTitle.textContent =  "images";
    menuList = document.createElement("UL");
    listItem = document.createElement("LI");
    listItem.classList.add("noFile");
    listItem.textContent = "add some cool file!";
    menuList.appendChild(listItem);
    this.menuContainer.appendChild(listTitle);
    this.menuContainer.appendChild(menuList);
    
    
    console.log("this.realModel");
    console.log(this.realModel);
    
    
    /* Default - open first paper */
    // TODO: select paper through url paramater
    //console.log(this.menuContainer);
    /*this.menuSection.appendChild(this.menuContainer);*/
    
    /*this.displayDoc(dataObj.book1.paper1.markdown);
    firstElement = this.menuContainer.querySelectorAll("P")[0];
    firstItem = firstElement.nextSibling.querySelectorAll("LI")[0];
    console.log(firstElement);
    firstElement.classList.add("open");
    firstElement.nextSibling.classList.add("open");
    firstItem.classList.add("active");*/
}
/* ====== End Load Document ====== */

MarkdownDoc.prototype.submitMenuList = function() {
}

MarkdownDoc.prototype.revertMenuList = function() {
    var choise = confirm("this will give up unsubmit list, are you sure?");
    if (choise) {
        this.onMenuEditState = false;
        this.documentList.classList.remove("onEdit");
        //this.menuLoading.classList.remove("hide");
        this.displayMenu(this.realModel);
        this.menuContainer.querySelector("P").click();
        this.menuContainer.querySelector("LI").click();
    }
}

MarkdownDoc.prototype.handleMenuEvent = function(event) {
    var keyRef;
    var oldActiveEl = this.menuContainer.querySelector("li.active");
    //console.log(event);
    //console.dir(event.target);
    if (event.target.tagName === "P") {
        /*event.target*/
        if (event.target.className.indexOf("open") >= 0 ){
            event.target.classList.remove("open");
            event.target.nextSibling.classList.remove("open");
        } else {
            event.target.classList.add("open");
            event.target.nextSibling.classList.add("open");
        }
    } else if (event.target.tagName === "LI") {
        if (event.target.className.indexOf("active") >= 0) {
            return;
        }
        keyRef = this.viewModel[event.target.parentNode.getAttribute("key")][event.target.getAttribute("item")].markdown;
        // console.log(keyRef);
        
        this.displayDoc(keyRef);
        if (oldActiveEl) { oldActiveEl.classList.remove("active") }
        event.target.classList.add("active");
    }
}


/* ====== Menu Edit Option ====== */
MarkdownDoc.prototype.handleOptionEvent = function(event) {
    if (event.target.tagName === "P" || event.target.tagName === "LI") {
        event.stopPropagation();
        event.preventDefault();
        this.targetElement = event.target;
        this.optionBG.classList.remove("hide");
        /*this.optionPanel.style.bottom = 0;*/
        this.optionPanel.style.top = (event.clientY + 5) + "px";
        this.optionPanel.style.left = (event.clientX + 5) + "px";
        
    }
}

MarkdownDoc.prototype.closeOptionPanel = function() {
    this.optionBG.classList.add("hide");
}

/*====== HERE ======*/

MarkdownDoc.prototype.triggerEditMode = function() {
    if (this.onMenuEditState) {
        return;
    } else {
        this.onMenuEditState = true;
        this.documentList.classList.add("onEdit");
    }
}

MarkdownDoc.prototype.addFolder = function() {
    console.log("add folder");
    this.triggerEditMode();
}

MarkdownDoc.prototype.addFile = function(evnet) {
    console.log("add file");
    //TODO: 整理這裡的code
    //在folder按下addFile時
    var parentEl = this.targetElement.parentNode;
    //var actvieEl = this.menuContainer.querySelector(".active");
    
    // Create new file element
    var newFileEl = document.createElement("LI");
    var itemVal = getTimeFormat();
    
    newFileEl.textContent = "new file";
    
    newFileEl.setAttribute("item", itemVal);
    
    parentEl.appendChild(newFileEl);
    
    this.editFileName(newFileEl, parentEl.getAttribute("key"), itemVal);
    this.addNewVmFile(newFileEl, parentEl.getAttribute("key"), itemVal);
    
    var obj = {
        "target": newFileEl
    };
    console.dir(obj.target);
    
    this.handleMenuEvent(obj);
    this.triggerEditMode();
    
}

MarkdownDoc.prototype.editFileName = function(fileEl, parentkey, itemVal) {
    fileEl.classList.add("edit");
    fileEl.setAttribute("contenteditable", true);
    fileEl.focus();
    
    //event binding
    fileEl.addEventListener("blur", onBlur.bind(this));
    fileEl.addEventListener("keydown", onKeyDown.bind(this));
    
    function onBlur() {
        console.log("- blur -");
        fileEl.removeAttribute("contenteditable");
        fileEl.classList.remove("edit");
        fileEl.classList.add("active");
        
        //console.info(fileEl);
        //console.log(this);
        //console.log(this.viewModel);
        
        //Change VM paperName
        this.viewModel[parentkey][itemVal].paperName = fileEl.textContent;
        fileEl.removeEventListener("blur", onBlur.bind(this));
        fileEl.removeEventListener("keydown", onKeyDown.bind(this));
    }
    
    function onKeyDown(event) {
        console.log("- onKeyDown -");
        //console.log(this);
        if (event.keyCode === 13) { 
            event.preventDefault();
            event.stopPropagation();
            onBlur.apply(this);
        }
    }
    
}

MarkdownDoc.prototype.addNewVmFile = function(newFileEl, parentkey, itemVal) {
    this.viewModel[parentkey][itemVal] = {};
    this.viewModel[parentkey][itemVal].markdown = "";
    this.viewModel[parentkey][itemVal].paperName = "new file";
    console.log(this.viewModel);
}

MarkdownDoc.prototype.renameFile = function() {
    console.log("rename file");
    this.triggerEditMode();
    console.log(this.targetElement);
    
    var parentkey = this.targetElement.parentNode.getAttribute("key");
    this.editFileName(this.targetElement, parentkey, this.targetElement.getAttribute("item"));
    
}

MarkdownDoc.prototype.deleteFile = function() {
    console.log("delete file");
    this.triggerEditMode();
    var choice = confirm("are you sure you want to delete this file?");
    if (choice) {
        var parentKey = this.targetElement.parentNode.getAttribute("key");
        var itemVal = this.targetElement.getAttribute("item");
        if (this.targetElement.className.indexOf("active") >= 0) {
            this.displayDoc("");
        }
        this.targetElement.parentNode.removeChild(this.targetElement);
        
        delete this.viewModel[parentKey][itemVal];
        console.log(this.viewModel);
            
    }
}

/*====== HERE ======*/



MarkdownDoc.prototype.switchPage = function(event) {
    var targetId = event.target.id;
    var activeElement = this.editTool.querySelector(".active");
    if (targetId === "editTool" || targetId === activeElement.id) {
        return;
    }
    activeElement.classList.remove("active");
    document.getElementById(targetId).classList.add("active");
    
    if (targetId === "submitBtn") {
        var choise = confirm("save this document?");
        if (choise) {
            this.saveDoc();
        } else {
            return;
        }
    }
    
    console.log(this.presentSection.querySelector(".active"));
    
    
    switch (targetId) {
        case "viewBtn":
            this.presentSection.querySelector(".active").classList.remove("active");
            this.view.classList.add("active");
            break;
        case "editBtn":
            this.presentSection.querySelector(".active").classList.remove("active");
            this.markdownEditor.classList.add("active");
            break;
        case "previewBtn":
            this.presentSection.querySelector(".active").classList.remove("active");
            var text = this.markdownEditor.value;
            this.preview.innerHTML = marked(text);
            this.preview.classList.add("active");
            /*console.log(text);*/
            break;
    }
}

MarkdownDoc.prototype.saveDoc = function(event) {
    //console.log("saveDoc");
    var text = this.markdownEditor.value;
    var activeElement = this.menuContainer.querySelector("li.active");
    var refString = "doc/" + activeElement.getAttribute("key") + "/" + activeElement.getAttribute("item");
    //event.preventDefault(); //??? why need?
    console.log(refString);
    this.setRef = this.database.ref(refString);
    this.setRef.child("markdown").set(text);
}

MarkdownDoc.prototype.displayDoc = function(text) {
    // console.log(text);
    this.view.innerHTML = marked(text);
    this.markdownEditor.innerHTML = text;
    
    // this.view.classList.add("active");
    this.view.classList.add("active");
}

//=== initialize ===
window.onload = function() {
    window.markdownDoc = new MarkdownDoc();
}


    