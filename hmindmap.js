

//切换开关，d 为被点击的节点
function toggle(root,d){
	if(d.children){ //如果有子节点
		d._children = d.children; //将该子节点保存到 _children
		d.children = null;  //将子节点设置为null
	}else{  //如果没有子节点
		d.children = d._children; //从 _children 取回原来的子节点
		d._children = null; //将 _children 设置为 null
	}
}

function diagonal(ds, dd) {
   var rps =radialPoint(ds.x,ds.y,ds)
   var rpd =radialPoint(dd.x,dd.y,dd)
   var s = {x:rps[1],y:rps[0]}
   var d = {x:rpd[1],y:rpd[0]}

   path = `M ${s.y} ${s.x}
           C ${(s.y + d.y) / 2} ${s.x},
             ${(s.y + d.y) / 2} ${d.x},
             ${d.y} ${d.x}`

   return path
 }

function redraw(g,root){

	var nodeUpdate = g.selectAll(".node")
		.data(root.descendants(), function(d){ return d.name; })

	//获取节点的exit部分
	var nodeExit = nodeUpdate.exit();

	var nodeEnter = nodeUpdate.enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d) { 
			//return "translate(" + radialPoint(d.x, d.y) + ")"; 
			return "translate(" + radialPoint(d.x, d.y,d) + ")"; 
			//return "translate(" + d.y+","+ d.x + ")"; 
		})
		.on("click", function(d) { 
			toggle(root,d); 
			//console.log("toggle",d);
			redraw(g,root); 
		});

	nodeEnter.append("circle")
		.attr("r", 8)
		.style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

	nodeEnter.append("text")
		.attr("dy", "0.31em")
		.attr("x", function(d) { return d.x < Math.PI === !d.children ? 14 : -14; })
		.attr("text-anchor", function(d) { return d.x < Math.PI === !d.children ? "start" : "end"; })
		.attr("transform", function(d) { 
			return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; 
		})
		.text(function(d) { 
			return d.data.name;
		})
		.on("click", function() { window.open("http://google.com"); 
		});

	//2. 节点的 Update 部分的处理办法
	var updateNodes = nodeUpdate.transition()
		.duration(500)
		.attr("transform", function(d) { 
			return "translate(" + radialPoint(d.x, d.y,d) + ")"; 
		});

	updateNodes.select("circle")
		.attr("r", 8)
		.style("fill", function(d) { 
			return d._children ? "lightsteelblue" : "#fff"; 
		});

	updateNodes.select("text")
		.style("fill-opacity", 1);

	//var exitNodes = nodeExit.remove()
	//3. 节点的 Exit 部分的处理办法
	var exitNodes = nodeExit.transition()
		.duration(500)
		.attr("transform", function(d) { 
			return "translate(" + radialPoint(d.x, d.y,d) + ")"; 
		}).remove();

	exitNodes.select("circle")
		.attr("r", 0)

	exitNodes.select("text")
		.style("fill-opacity", 0);

	/*
	（3） 连线的处理
	 */
	//获取连线的update部分
	var linkUpdate= g.selectAll(".link")
		.data(root.links(),function(d){ return d.target.data.name; })

	//获取连线的enter部分
	var linkEnter=linkUpdate.enter();

	//var linkUpdate =  link;
		/*svg.selectAll(".link")
		.data(root.links(), function(d){ return d.target.name; });*/


	//获取连线的exit部分
	var linkExit = linkUpdate.exit();

	//1. 连线的 Enter 部分的处理办法
	linkEnter.append("path")
		.attr("class", "link")
		.attr("d",function(d){
			return diagonal(d.source, d.target)
		});

	//2. 连线的 Update 部分的处理办法
	linkUpdate.transition()
		.attr("class", "link")
		.attr('d', function(d){
			return diagonal(d.source, d.target)
		})
		.duration(500)

	//3. 连线的 Exit 部分的处理办法
	  // Remove any exiting links
	linkExit.transition()
		.duration(500)
		.attr('d', function(d) {
			return diagonal(d.source,d.source)
		}).remove();
}



function radialPoint(x, y,d) {
	return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
}

function updateData(object,data){
	var rootData = d3.hierarchy(data);
	var root = object.tree(rootData);
	object.g.html("")
	redraw(object.g,root)
}

function transjson(data){
	var res=[]
	for (var k in data) {
		var node={
			name:k,
			children:transjson(data[k])
		}
		res.push(node)
	}
	return res
}

function hmarkdown(element){
	var svg = d3.select(element),
		width = +svg.attr("width"),
		height = +svg.attr("height"),
		g = svg.append("g").attr("transform", "translate(" + (width / 2 -40 ) + "," + (height / 2 ) + ")");

	var tree = d3.tree()
		.size([2 * Math.PI, width/3])
		.separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

	var object={
		tree:tree,
		svg:svg,
		g:g,
		height:height,
		width:width
	};
	return object;
}
