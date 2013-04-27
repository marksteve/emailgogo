function renderGraph(series) {
  var palette = new Rickshaw.Color.Palette({scheme: 'spectrum14'});
  series = series.forEach(function(s) {
    var element = document.getElementById(s.name);

    if (s.data.length) {
      s.color = palette.color();

      var graph = new Rickshaw.Graph({
        element: element,
        width: 640,
        height: 180,
        renderer: 'line',
        padding: {
          top: 0.1
        },
        interpolation: 'linear',
        series: [s]
      });
      graph.render();

      var axes = new Rickshaw.Graph.Axis.Time({
        graph: graph
      });
      axes.render();

      new Rickshaw.Graph.HoverDetail( {
        graph: graph
      });

    } else {
      element.textContent = "No data yet.";
    }

  });

}
