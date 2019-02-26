function checkIfUrl(index) {
  const domains = ["com","uk","ng","io","eu","za","us","africa","tech","ga","tk","ma","edu","ly","tv"];
  if (index.substr(0,4) !== 'http'){
    splitUrl = index.split('/')[0].split('.');
    if (splitUrl.length > 1 && domains.includes(splitUrl.pop())){
      return true;
    }
  }
  else{
    splitUrl = index.split('/')[2].split('.');
    if (splitUrl.length > 1 && domains.includes(splitUrl.pop())){
      return true;
    }
  }
  return false;
}

function toUrlCheck(params) {
  var badCharacters = [".","/","?",",","-",")"];
  const splitNow = params.toString().split(" ");
  splitNow.forEach(word => {
    if (badCharacters.includes(word.split("").pop())){
      var word1 = word.slice(0, word.length - 1);
      if (checkIfUrl(word1)){
        if (word1.substr(0,4) === "http"){
          var html = `<a target="_blank" href="${word1}">${word} <a/> `;
          splitNow[splitNow.indexOf(word)] = html; 
        }
        else{
          var html = `<a  target="_blank" href="http://${word1}">${word} <a/> `;
          splitNow[splitNow.indexOf(word)] = html; 
        }
      }
    }
    else {
      if (checkIfUrl(word)){
        if (word.substr(0,4) === "http"){
          var html = `<a target="_blank" href="${word}">${word} <a/> `;
          splitNow[splitNow.indexOf(word)] = html; 
        }
        else{
          var html = `<a  target="_blank" href="http://${word}">${word}<a/> `;
          splitNow[splitNow.indexOf(word)] = html; 
        }
      }
    }
  });
  var textHtml = splitNow.join(" ");
  return textHtml;
}
