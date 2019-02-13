function add(a,b) {
  if (typeof a !== 'number' || typeof b !== 'number'){
    throw {
      name:'TypeError',
      message:'arguments must be numbers'
    }
  }
  return a + b;
}

var Player = function (name, position) {
  this.name = name;
  this.position = position;
}

Player.prototype.introduce = function () {
  return (`i'm ${this.name} and i play ${this.position}`)
}
class Player {
  constructor(name, position){
    this.name = name;
    this.position = position;
  }
  introduce(){
    return (`i'm ${this.name} and i play ${this.position}`);
  }
}

Array.prototype.concatAll = function (){
  for (let i = 0; i < arguments.length; i++) {
    for (let j = 0; j < arguments[i].length; j++) {
      this.push(arguments[i][j]);
    }
  }
  return this;
}

var isArray = function(array){
  return (array && typeof array === 'object' && typeof array.length === 'number'
         && typeof array.splice === 'function'  && !(array.propertyIsEnumerable('length')))
}

  //Matrices
  class Matrix {

   static isArray(array){
      return (array && typeof array === 'object' && typeof array.length === 'number'
             && typeof array.splice === 'function'  && !(array.propertyIsEnumerable('length')))
    }

    static matDimension(matrix){
      if (!Matrix.isArray(matrix)){
        throw {
          name:'TypeError',
          message:'Matrix.matDimension() requires a matrix (array)'
        }
      }
      var rows = matrix.length;
      let columns = 0;
      if (matrix[0]){
        if (!Matrix.isArray(matrix[0])){
          columns = 1;
        }
        else{
          columns = matrix[0].length
          
        }
      }
      return {
        rows:rows,
        columns:columns
      }
    }
    static dim(dimension, stub){
      var a = []
      for (let i = 0; i < dimension; i++) {
        a[i] = stub;
      }
      return a;
    }
    
    static  matrix(m, n, init){
      var mat = []
      for (let i = 0; i < m; i++) {
        mat[i] = [];
      }
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          mat[i][j] = init;
        }
      }
      
      return mat;
    }
    
    static identityMatrix(n) {
      var matrix = Matrix.matrix(n,n,0);
      for (let i = 0; i < n; i++) {
        matrix[i][i] = 1;
      }
      return matrix;
    }

    static add(...args){
      var finalMatrix = [];
      for (let i = 0; i < args.length; i++) {
        if (!Matrix.isArray(args[i])){
          throw Error(`${args[i]} is not an array matrix!`);
        }
      }
      for (let i = 0; i < args.length; i++) {
        
        
      }
    }
  }

Array.prototype.lastpop = function(){ //implementing array.pop
  return this.splice(this.length - 1, 1)[0]
}

Array.prototype.pushie = function(...args){ //implementing array.push
  console.log(args)
}

var m = [4,15,23,42,116,16];

const sortThis = (arr, mode) => (
  arr.sort(function (a , b) {
    if (a === b) return 0
    if (mode === "asc"){
      if (typeof a === typeof b) return a < b ? -1 : 1;
      return typeof a < typeof b ? -1 : 1;
    }
    else if (mode === "desc"){
      if (typeof a === typeof b) return a > b ? -1 : 1;
      return typeof a > typeof b ? -1 : 1;
    }
  })
)
const by = (name) => (
  function(o, p) {
    var a, b;
    if (typeof o === 'object' && typeof p === 'object' && o && p){
      a = o[name]
      b = p[name]
      if (a === b) return 0
      if (typeof a === typeof b) return a < b ? -1 : 1;
      return typeof a < typeof b ? -1 : 1;
    }
    else{
      throw Error('Expected an array of objects')
    }
  }
)

var s = [
  {first: 'Joe', last: 'Besser'},
  {first: 'Moe', last: 'Howard'},
  {first: 'Joe', last: 'DeRita'},
  {first: 'Shemp', last: 'Howard'},
  {first: 'Larry', last: 'Fine'},
  {first: 'Curly', last: 'Howard'}
  ]; 
s.sort(by('first'));
/**
 * if (req.body.password === req.body.cpassword) {
          bcrypt.genSalt(10).then(salt => {
            bcrypt.hash(req.body.password, salt)
              .then(hash => {
                User.updateOne({ username: username }, { $set: { password: hash } })
                  .then(resp => {
                    req.flash('success', 'password successfully changed, Login with new password');
                    res.redirect('/users/login');
                  })
              })
          })
        }
        else {
          res.render('forgot', {
            errormsg: 'passwords do not match',
            username: req.body.username,
            email: req.body.email,
            passport: req.body.password
          })
        }
      }
 * 
 */