function getTimeFormat() {
	var date = new Date();
  var currentTime = "" + date.getFullYear()
  	 + timeFormate(date.getMonth()+1)
     + timeFormate(date.getDate())
     + "-"
     + timeFormate(date.getHours())
     + timeFormate(date.getMinutes())
     + timeFormate(date.getSeconds());
  
  //private method
  function timeFormate(value) {
  	if (value < 10) {
    	return "0" + value;
    } else {
    	return value;
    }
  }
  
  return currentTime;
}