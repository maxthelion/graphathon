Array.prototype.max = function() {
  var max = this[0];
  var len = this.length;
  for (var i = 1; i < len; i++) if (this[i] > max) max = this[i];
  return max;
}
Array.prototype.min = function() {
  var min = this[0];
  var len = this.length;
  for (var i = 1; i < len; i++) if (this[i] < min) min = this[i];
  return min;
}

pusherlineargradient = function(ctx, graphHeight){
  var lineargradient = ctx.createLinearGradient(0,0,0, graphHeight);  
  lineargradient.addColorStop(0.5,  pusherColor);  
  lineargradient.addColorStop(1,  pusherColor2);
  return lineargradient
}

var LineGraph = function(holder_id, data, threshold) {
  var maxY = data.max();
  var minY = data.min();
  var data = data;
  var labelElement;
  var threshold = threshold;
  var holder;
  var canvas;
  var ctx;
  
  var initialise = function(){
    holder = $('#' + holder_id);
    canvas_id = holder_id + '_c'
    canvas_html = $('<canvas id="'+canvas_id+'" class="graph_canvas" height="'+graphSet.graphHeight+'" width="'+graphSet.graphWidth+'"></canvas>');
    holder.append(canvas_html);
    canvas = document.getElementById(canvas_id)
    ctx = canvas.getContext('2d');
    
    // create connection_label    
    // <div id="connection_label" class="sidething">
    //   <span class="bignum"></span>
    // </div>
    var side_thing = $('<div id="'+holder_id+'_l" class="sidething"></div>')
    holder.append(side_thing)
    labelElement = side_thing;
  };
  
  var draw = function(){
    clearGraph()
    draw_gradient();
    draw_threshold();
    draw_white_mask();
    draw_line();
    // draw_circles();
    draw_big_circle();
  };
  
  var draw_white_mask = function(){
    ctx.beginPath();
    ctx.moveTo(leftOffset, 0);
    ctx.fillStyle = "white"
    for(var i= 0; i < data.length; i++){       
      ctx.lineTo(
        xPoint(i), 
        yHeight(data[i])
      );
    }
    ctx.lineTo( graphSet.graphWidth, 0);
    ctx.closePath();
    ctx.fill();
  };
  
  var draw_line = function(){
    ctx.beginPath();
    ctx.moveTo(leftOffset, yHeight(data[i]));
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    for(var i= 0; i < data.length; i++){       
      ctx.lineTo(xPoint(i), yHeight(data[i]))
    }
    ctx.stroke();
  };
  
  var xPoint = function(i){
    return i * xInterval() + leftOffset;
  }
  
  var draw_threshold = function(){
    if (threshold){
      ctx.beginPath();
      ctx.fillStyle = "rgba(255, 0, 0, 0.4)"
      ctx.rect(leftOffset,0, graphSet.graphWidth, threshold);
      ctx.fill();
    };
  }
  
  var draw_gradient = function(){
    ctx.fillStyle = pusherlineargradient(ctx, graphSet.graphHeight);  
    ctx.rect(leftOffset,0, graphSet.graphWidth, graphSet.graphHeight);
    ctx.fill();
  }
  
  var draw_circles = function(){
    for(var i= 0; i < data.length; i++){
      draw_circle(
        xPoint(i), 
        yHeight(data[i]),
        myDotRadius
      );
    }
  };
  
  var draw_circle = function(x, y, radius) {
    ctx.strokeStyle = "white"
    ctx.lineWidth = dotStrokeWidth;
    ctx.beginPath();
    ctx.fillStyle = dotColor;
    ctx.arc(
      x, 
      y,
      radius,
      0,
      Math.PI*2,
      true
    );
    ctx.fill();
    ctx.stroke();
  }
  
  var draw_big_circle = function(){
    draw_circle(
      xPoint(xIndex), 
      yHeight(data[xIndex]),
      10
    );
  }
  
  var draw_y_axis = function(){
    var y_element = $('<div>');
    y_element.addClass('yAxis');
    
    y_element.append(add_y_label(maxY));
    y_element.append(add_y_label(minY));
    
    holder.append(y_element);
  }
  
  var add_y_label = function(y){
    var label = $("<span>"+y+"</span>");
    var textHeight = 10;
    var distanceFromTop = graphSet.graphHeight - (graphSet.graphHeight * (y / maxY)) - (textHeight/2)
    label.css('top', distanceFromTop +"px");
    label.css('position', "absolute");
    return label;
  }
  
  var clearGraph = function(){
    ctx.clearRect(0,0, graphSet.graphWidth, graphSet.graphHeight);
  }
  
  var xInterval = function(){
    return (graphSet.graphWidth - leftOffset) / (data.length - 1)
  };
  
  var yHeight = function(y) {
    return graphSet.graphHeight - (y * yScale());
  };
  
  var yScale = function() {
    return graphSet.graphHeight / maxY; 
  };
  
  initialise();
  draw();
  draw_y_axis();
  
  $(canvas).mousemove(function(evt){
    xIndex = Math.floor( evt.offsetX/xInterval() )
    labelElement.html( 
      '<span class="bignum">' + Math.floor(data[xIndex]) + '</span>' 
    )
    draw();
  })
  
  $(canvas).mouseout(function(evt){
    xIndex = null
    labelElement.html( '' )
    draw();
  })
};

var DailyMessageGraph = function(holder_id, data) {
  var maxY = data.max();
  var data = data;
  var padding = 30;
  var labelWidth = 50;
  var paddingTop = 10;
  var holder;
  var ctx;
  var canvas;
  
  var initialise = function(){
    holder = $('#' + holder_id);
    canvas_id = holder_id + '_c'
    canvas_html = $('<canvas id="'+canvas_id+'" class="graph_canvas" height="'+graphSet.graphHeight+'" width="'+graphSet.graphWidth+'"></canvas>');
    holder.append(canvas_html);
    canvas = document.getElementById(canvas_id)
    ctx = canvas.getContext('2d');
  };
  
  var draw = function(){
    ctx.fillStyle = pusherlineargradient(ctx, graphSet.graphHeight);
    ctx.beginPath();
    for(var i= 0; i < data.length; i++){
      roundedRect(
        ctx,
        xPoint(i), 
        yTopOffset(data[i]),
        xInterval() - padding,
        yHeight(data[i]),
        10
      )
    }
    draw_labels();
  }
  
  var draw_labels = function(){
    for(var i= 0; i < data.length; i++){
      var label = $('<span>')
      label.text(data[i]);
      label.addClass('bar_label');
      label.css('left', (i * xInterval()) + (xInterval() / 2 ) + 'px')
      $('#daily_message_canvas_holder').append(label)
    }
  }
  
  // distance in pixels that one data point represents
  var xInterval = function(){
    return graphSet.graphWidth / (data.length)
  };
  
  // distnace from the top given a y value
  var yTopOffset = function(y){
    return graphSet.graphHeight - yHeight(y);
  };
  
  // height of a column
  var yHeight = function(y) {
    return  y * yScale();
  };
  
  // the scale factor to convert a point of data to pixel amount on the y axis
  var yScale = function() {
    return (graphSet.graphHeight - paddingTop) / maxY; 
  };
  
  // distance from the left to draw a column
  var xPoint = function(i){
    return i * xInterval() + padding / 2 + leftOffset;
  };
  
  function roundedRect(ctx,x,y,width,height,radius){  
    ctx.beginPath();  
    ctx.moveTo(x,y+radius);  
    ctx.lineTo(x,y+height);  
    ctx.lineTo(x+width,y+height);  
    ctx.lineTo(x+width,y+radius);  
    ctx.quadraticCurveTo(x+width,y,x+width-radius,y);  
    ctx.lineTo(x+radius,y);  
    ctx.quadraticCurveTo(x,y,x,y+radius);  
    ctx.fill();  
  };
  
  initialise();
  draw();
};

var XLabel = function(element, startDate, endDate){
  var labelData = ['mon', 'tues', 'weds', 'thurs', 'fri'];
  var xInterval = graphSet.graphWidth / labelData.length;
  var element = element;
  labelWidth = 50;
  
  var draw = function(){
    for (var i=0; i < labelData.length; i++) {
      var label = labelData[i];
      var span = $('<span>');
      span.css('left', myleft(i) + 'px')
      span.text(label)
      element.append(span);
    };
  };
  
  var myleft = function(i){
    return i * xInterval + (labelWidth/2);
  };
  
  draw()
}