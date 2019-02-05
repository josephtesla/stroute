const getSignedRequest = (file) => {
  const name = encodeURIComponent(file.name);
  const type = encodeURIComponent(file.type);
  const xhr = new XMLHttpRequest();
  xhr.open('GET',`http://localhost:3000/sign-s3?file-name=${name}&file-type=${type}` );
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4){
      if (xhr.status === 200){
        const response = JSON.parse(xhr.responseText);
        uploadFile(file, response.signedRequest, response.url);
      }
      else{
        console.log('Could not get signed URL.', error);
      }
    }
  }
}

const uploadFile = (file, signedRequest, url) => {
  const xhr = new XMLHttpRequest();
  xhr.open('PUT', signedRequest, url);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4){
      if (xhr.status === 200){
        //update the chats dom
        //update the url input
      }
      else{
        console.log('couldnot upload file:', error)
      }
    }
  }
  xhr.send(file);
}