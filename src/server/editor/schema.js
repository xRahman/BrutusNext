// Initialize the editor with a JSON schema
var editor = new JSONEditor(document.getElementById('editor_holder'), {
  schema: {
    type: "object",
    title: "Car",
    properties: {
      make: {
        type: "string",
        enum: [
          "Toyota",
          "BMW",
          "Honda",
          "Ford",
          "Chevy",
          "VW"
        ]
      },
      model: {
        type: "string"
      },
      year: {
        type: "integer",
        enum: [
          1995, 1996, 1997, 1998, 1999,
          2000, 2001, 2002, 2003, 2004,
          2005, 2006, 2007, 2008, 2009,
          2010, 2011, 2012, 2013, 2014
        ],
        default: 2008
      }
    }
  }
});

// Hook up the submit button to log to the console
document.getElementById('submit').addEventListener('click', function() {
  
  var request = new XMLHttpRequest();   // new HttpRequest instance

  /*
  // We define what will happen if the data are successfully sent
  request.addEventListener("load", function(event)
  {
    alert(event.target.responseText);
  });
  
  // We define what will happen in case of error
  request.addEventListener("error", function(event)
  {
    alert('Oups! Something goes wrong.');
  });
  */

  /// Pozn.: To /json-handler asi pujde pouzit na druhe strane na rozklicovani,
  /// co jsem to vlastne dostal.
  request.open("POST", "/json-handler");
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  //console.log("Sending data: " + JSON.stringify(editor.getValue()) + "\n");
  request.send(JSON.stringify(editor.getValue()));

});