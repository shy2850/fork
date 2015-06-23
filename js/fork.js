;(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.Fork = factory();
  }

}(this,function(require, exports, module) {
    var create = function(tag){ 
        return document.createElement(tag) 
    };

    var render = function(data){
        var dl = create("dl"),
            dt = create("dt");

        dt.innerHTML = data.name;
        if(data.info ){ dt.title = data.info; }
        if(data.id ){ dt.id = data.id; } 
        if(data.init){ dt.className = "dt-empty"; }
        dl.appendChild(dt);

        for (var i = 0; i < data.fork.length; i++) {
            var dd = create("dd"),
                ii = create("i");
            ii.innerHTML = data.fork[i].label;
            ii.title = data.fork[i].label_info || "";
            dd.appendChild( ii );
            if( data.fork[i].node ){
                dd.appendChild( render(data.fork[i].node) );
            }else{
                dd.appendChild( render({
                    name: "请添加",
                    fork: [],
                    init: true
                }) );
            }
            dl.appendChild( dd );
        };

        return dl;
    };

    var parse = function(dl){
        if( !dl || !dl.children ) {
            return null;
        }else{
            if( document.querySelectorAll(".dt-empty").length ){
                alert( "有空节点为完成编辑！" );
                return null;
            }
        }
        var cdr = dl.children,
            dt = cdr[0],
            node = {name:dt.innerHTML,fork:[]};
        for (var i = 1; i < cdr.length; i++) {
            node.fork.push({
                label: cdr[i].children[0].innerHTML,
                label_info: cdr[i].children[0].title,
                node: parse(cdr[i].children[1])
            });
        };
        return node;
    };

    var position = function(dl){
        var getLeaf = function(dl){
            return [].filter.call( dl.getElementsByTagName('dt'), function(dt){
                return !dt.nextElementSibling
            } ).length;
        };

        var items = getLeaf(dl);
        dl.style.width =  items * 100 + "px";

        for (var i = 1; i < dl.children.length; i++) {
            dl.children[i].style.width = getLeaf(dl.children[i]) * 100 + "px";
            dl.children[i].style.left = ( parseInt( dl.children[i-1].style.width ) || 0 ) + ( parseInt( dl.children[i-1].style.left ) || 0 ) + "px";
            position( dl.children[i].children[1] );
        };

        if( dl.parentNode.tagName.toUpperCase() !== "DD" ){
            // 顶层标签居中
            dl.style.left = "50%";
            dl.style.marginLeft = -items * 50 + "px";
        }

    };

    var Fork = function( holder ){
        // 获取承载标签
        this.holder = document.querySelector( holder );
        this.holder.classList.add("fork-holder");
        // 设置元数据, 并渲染标签结构
        this.setData = function(d){
            this.holder.appendChild( render(d) );
            position( this.holder.children[0] );
        };

        this.addLabel = function(node, label){
            var dd = create("dd"),
                ii = create("i"),
                dl = create("dl"),
                dt = create("dt");
            ii.innerHTML = label.label;
            ii.title = label.label_info;
            dd.appendChild(ii);
            dt.className = "dt-empty";
            dt.innerHTML = "空节点";
            dl.appendChild(dt);
            dd.appendChild(dl);
            node.parentNode.appendChild(dd);
            position( this.holder.children[0] );
            return dd;
        };
        this.setLabel = function(node, label, index){
            var dd = node.parentNode.children[index],
                ii;
            if( !dd && label ){
                this.addLabel(node, label);
            }else if( dd && !label ){
                dd.parentNode.removeChild( dd );
            }else{
                ii = dd.children[0];
                ii.innerHTML = label.label;
                ii.title = label.label_info;
            }
        };

        this.setNode = function(node, data){
            node.classList.remove("dt-empty");
            node.innerHTML = data.name;
            if(data.info){
                node.title = data.info;
            }
            if(data.fork){
                var len = Math.max( data.fork.length, node.parentNode.children.length - 1 ),
                    len1 = Math.min( data.fork.length, node.parentNode.children.length - 1 );
                for (var i = 0; i < len; i++) {
                    this.setLabel( node, data.fork[i], i+1 );
                };

                if( len !== len1 ){
                    position( this.holder.children[0] );
                }
            }
        };

        // 根据标签结构获取数据
        this.parse = function(dom){
            return parse( dom ? dom.parentNode : this.holder.children[0] );
        };
    };

    // 通过源数据渲染标签不添加
    Fork.render = render;
    // 通过标签结构获取数据
    Fork.parse = parse;
    return Fork;
}));