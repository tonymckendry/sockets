app.controller('mainController', function($scope, $rootScope, $location, socket, $http) {
  $scope.tweets = []
  $scope.streaming = true;
  $scope.showSplash = true;
  $scope.total = 0;
  // $scope.tweets = thing;

  $scope.clearData = function(){
    dataset = []
    $scope.tweets = []
    $scope.total = 0
    $scope.average = 0
    $scope.negWidth = 0
    $scope.posWidth = 0
    d3.selectAll("svg > *").remove();
    var svg = d3.select('div.a') //creates the canvas
      .append('svg')
      .attr('width', w)
    $scope.$digest()
  }

  $scope.hideSplash = function(){
    $scope.showSplash = false;
  }

  var svg = d3.select('div.a') //creates the canvas
    .append('svg')
    .attr('width', w)

  // svg.append('g') // create X axis
  //   .attr('class', 'axis')
  //   .attr('transform', 'translate(0,' + (h - padding) + ')')
  //   .call(xAxis)
  //
  // svg.append('g') // Create Y axis
  //   .attr('class', 'axis')
  //   .attr('transform', 'translate(' + padding + ',0)')
  //   .call(yAxis)

  socket.on('newTweet', function(tweet){
      // console.log(tweet);
      var obj = {}
      obj.user = tweet.user.name
      obj.tweet = tweet.text
      var arr = tweet.text.split(' ')
      var score = 0
      var count = 0
      var rand1 = Math.random()
      var rand2 = Math.random()
      var rando = Math.random()
      var rando2 = Math.random()
      for (var i = 0; i < arr.length; i++) {
        if(dictionary[arr[i]]){
          // console.log("'" + arr[i] +  "' exists in dictionary")
          // console.log('sentiment: ' + dictionary[arr[i]])
          score += dictionary[arr[i]]
          count ++
        }
      }
      if (rando > .2) {
        if (rando2 > .5) {
          score += rand1
        }
        else{
          score -= rand1
        }
        if (rando2 > .5) {
          count += rand2
        }
        else{
          count -= rand2
          if (count < 0) {
            count = 0
          }
        }
      }
      score = score*10
      count = count*10

      if (score < -100) {
        score = -100
      }
      if (score > 100) {
        score = 100
      }

      var newNumber1 = score
      var newNumber2 = tweet.text.length
      dataset.push([newNumber1, newNumber2])
      ///////Scales
      var xScale = d3.scale.linear()
      .domain([-100, 100])
      .range([padding, w - padding])

      var yScale = d3.scale.linear()
      .domain([0, 140])
      .range([h - padding, padding])

      var rScale = d3.scale.linear() // sets the scale for the dot radius
      .domain([0, d3.max(dataset, function(d){ return d[1]})]) // finds the greatest Y value
      .range([2, 7])
      //////
      svg.selectAll('circle') // creates the dots
        .data(dataset)
        .enter()
        .append('circle')
        .attr('cx', function(d){ //x position, scaled
          return xScale(d[0])
        })
        .attr('cy', function(d){ //y position, scaled
          return yScale(d[1])
        })
        .attr('r', function(d){ //dot radius, scaled
          return rScale(d[1])
        })
        .attr('fill', function(d){
          var r = 0
          var b = 0
          var g = 255
          if (d[0] < 0){
            r = Math.round(d[0] * -2.55)
            g = Math.round(255 - (d[0] * -2.55))
          }
          if (d[0] > 0){
            b = Math.round(d[0] * 2.55)
            g = Math.round(255 - (d[0] * 2.55))
          }
          if (g == undefined){
            g = 255
          }
          var color = 'rgb(' + r + ',' + g + ',' + b + ')'
          return color
        })

        var r = 0
        var b = 0
        var g = 255
        if (score < 0) {
          var r = Math.round(score * -2.55)
          var g = Math.round(255 - (score * -2.55))
        }
        if (score > 0) {
          var b = Math.round(score * 2.55)
          var g = Math.round(255 - (score * 2.55))
        }
        if (g == undefined){
          g == 255;
        }
        var color = 'rgb(' + r + ',' + g + ',' + b + ')'
        obj.color = color
      svg.insert("circle", "rect")
        .attr("cx", xScale(score))
        .attr("cy", yScale(tweet.text.length))
        .attr("r", 1e-6)
        .style("stroke", color)
        .style("stroke-opacity", 1)
        .style('fill-opacity', 0)
      .transition()
        .duration(2000)
        .ease(Math.sqrt)
        .attr("r", 100)
        .style("stroke-opacity", 1e-6)
        .remove();
      // svg.selectAll('text') //labels the dpts
      //   .data(dataset)
      //   .enter()
      //   .append('text')
      //   .text(function(d){
      //     return d[0] + ',' + d[1]
      //   })
      //   .attr('x', function(d){
      //     return xScale(d[0])
      //   })
      //   .attr('y', function(d){
      //     return yScale(d[1])
      //   })
      //   .attr('font-family', 'sans-serif')
      //   .attr('font-size', '11px')
      //   .attr('fill', 'white')
      var average = 0
      var counter = 0
      for (var i = 0; i < dataset.length; i++) {
        if (dataset[i][0] > 3 || dataset[i][0] < -3) {
          average += dataset[i][0]
          counter ++
        }
      }
      average = (average / counter).toFixed(2)
      $scope.average = average
      $scope.emoji = "😶"
      if (average < 0 && average > -3 || average > 0 && average < 3 ) {
        $scope.emoji = "😐"
      }
      if (average < -3 && average > -10) {
        $scope.emoji = "😑"
      }
      if (average > 3 && average < 10 ) {
        $scope.emoji = "🙂"
      }
      if (average < -10 && average > -20) {
        $scope.emoji = "🙁"
      }
      if (average > 10 && average < 20 ) {
        $scope.emoji = "😃"
      }
      if (average < -20 && average > -30) {
        $scope.emoji = "😧"
      }
      if (average > 20 && average < 30 ) {
        $scope.emoji = "😋"
      }
      if (average < -30 && average > -40) {
        $scope.emoji = "😠"
      }
      if (average > 30 && average < 40 ) {
        $scope.emoji = "😁"
      }
      if (average < -40 && average > -50) {
        $scope.emoji = "😡"
      }
      if (average > 40 && average < 50 ) {
        $scope.emoji = "😊"
      }
      if (average < -50 && average > -75) {
        $scope.emoji = "💩"
      }
      if (average > 50 && average < 75 ) {
        $scope.emoji = "😍"
      }
      $scope.negWidth = parseInt(average*-1);
      $scope.posWidth = parseInt(average);
      var avr = 0
      var avb = 0
      var avg = 255
      if (average < 0) {
        avr = Math.round(average * -2.55)
        avg = Math.round(255 - (average * -2.55))
      }
      if (average > 0) {
        avb = Math.round(average * 2.55)
        avg = Math.round(255 - (average * 2.55))
      }
      if (avg == undefined){
        avg == 255;
      }
      var avcolor = 'rgb(' + avr + ',' + avg + ',' + avb + ')'
      $scope.avcolor = avcolor
      $scope.total = dataset.length
      $scope.tweets.unshift(obj)
      $scope.$digest()
  })

  $scope.callIt = function(term){ //starts the tweet stream when you press the button
    console.log('CALLED IT');
    $http.get('/' + term).success(function(data){
    })
    console.log('streaming success');
    $scope.streaming = true;
    $scope.showGraph = true;
  }

  $scope.stopIt = function(){ //stops the tweet stream when you press the button
    console.log('Stop Button');
    $scope.streaming = false
    $http.get('/stop').success(function(data){
      console.log('DATA!');
      console.log(data)
    })
  }

 });
