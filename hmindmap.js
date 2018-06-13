

//切换开关，d 为被点击的节点
function toggle(root,d){

	/*root.each(function(d) {
		d.x0 = d.x;
		d.y0 = d.y;
	});*/
	if(d.children){ //如果有子节点
		d._children = d.children; //将该子节点保存到 _children
		d.children = null;  //将子节点设置为null
	}else{  //如果没有子节点
		d.children = d._children; //从 _children 取回原来的子节点
		d._children = null; //将 _children 设置为 null
	}
}

function redraw(g,root,source){

	//获取连线的update部分
	var linkUpdate= g.selectAll(".link")
		.data(root.links(),function(d){ return d.target.name; })

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
		.on("click", function(d) { toggle(root,d); console.log("toggle",d); redraw(g,root,d); });

	nodeEnter.append("circle")
		.attr("r", 8)
		.style("fill", function(d) { return d._children ? "lightsteelblue" : "#aff"; });

	nodeEnter.append("text")
		.attr("dy", "0.31em")
		.attr("x", function(d) { return d.x < Math.PI === !d.children ? 14 : -14; })
		.attr("text-anchor", function(d) { return d.x < Math.PI === !d.children ? "start" : "end"; })
		.attr("transform", function(d) { 
			return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; 
		})
		.text(function(d) { 
			return d.data.name;
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
			return d._children ? "lightsteelblue" : "#aff"; 
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

	//获取连线的enter部分
	var linkEnter=linkUpdate.enter().append("path")
		.attr("class", "link")
		.attr("d", d3.linkRadial()
			.angle(function(d) { return d.x; })
			.radius(function(d) { return d.y; }));

	//var linkUpdate =  link;
		/*svg.selectAll(".link")
		.data(root.links(), function(d){ return d.target.name; });*/


	//获取连线的exit部分
	var linkExit = linkUpdate.exit();

	//1. 连线的 Enter 部分的处理办法
	linkEnter.insert('path', "g")
      .attr("class", "link");
      /*.attr('d', function(d){
        var o = {x: d.x0, y: d.y0}
        return diagonal(o, o)
      });*/

	//2. 连线的 Update 部分的处理办法
	linkUpdate.transition()
		.duration(500)

	//3. 连线的 Exit 部分的处理办法
	/*linkExit.transition()
		.duration(500)
		.remove();*/
	  // Remove any exiting links
	var linkExit = linkExit.transition()
		.duration(500).remove();
		/*.attr('d', function(d) {
			var o = {x: d.x, y: d.y}
			return diagonal(o, o)
		})*/
	console.log("end",linkExit);
	/*
	（4） 将当前的节点坐标保存在变量x0、y0里，以备更新时使用
	 */
	root.each(function(d) {
		d.x0 = d.x;
		d.y0 = d.y;
	});
}



function radialPoint(x, y,d) {
	return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
}

function updateData(object,data){
	var rootData = d3.hierarchy(data);
	//给第一个节点添加初始坐标x0和x1
	//rootData.x0 = object.height / 2;
	//rootData.y0 = object.width / 2 ;
	//sd=stratify(data);
	var root = object.tree(rootData);
	redraw(object.g,root,root)
}


function hmarkdown(element){
	var svg = d3.select("svg"),
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
	//d3.csv("flare.csv", function(error, data) {
	d3.json("learn.json", function(error, data) {
		if (error) throw error;
		updateData(object,data);
	});
}

hmarkdown("svg");
