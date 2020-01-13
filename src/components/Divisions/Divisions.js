class Divisions{
  static changeInput(input){
    var newInput='';

    switch (input) {
      case "Ingeniería":
        newInput="DIT"
        break;
      case "Tecnología":
        newInput="DIT"
        break;
      case "Tecnologías":
        newInput="DIT"
        break;
      case "Negocios":
        newInput="DINE"
        break;
      case "Educación":
        newInput="DIEHU"
        break;
      case "Humanidad":
        newInput="DIEHU"
        break;
      case "Humanidades":
        newInput="DIEHU"
        break;
      case "Derecho":
        newInput="DECS"
        break;
      case "Salud":
        newInput="VICSA"
        break;
      case "Medicina":
        newInput="VICSA"
        break;
      case "Arte":
        newInput="DAAD"
        break;
      case "Artes":
        newInput="DAAD"
        break;
      case "Arquitectura":
        newInput="DAAD"
        break;
      case "Diseño":
        newInput="DAAD"
        break;
      default:
        newInput=input;
    }

    return newInput
  }
}
module.exports = Divisions
