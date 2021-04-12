import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NovenaService {

  constructor() {
    console.log("Servicio listo para usar!!!");
  }

  private comun:Comun[] = [
    {
      instructions:"Estando de rodillas delante de la Imágen de Nuestra Señora, se dirá el Acto de contrición y después la siguiente:",
      instructions2:"Aquí se rezará un 'Padre nuestro' y una 'Ave María' y se hará la petición.",
      advertenciasTitle:"Advertencias",
      advertenciasText:"Es María Santísima (decía S. Bernardo) conducto de todos los beneficios: no concede la Divina Majestad cosa a este mundo sin pasar por la mano de María. Es tan forzosa la gracia en nuestras operaciones, que no serán meritorias si les faltase este don; y siendo el fin de las Novenas el conseguir algún bien o el evitar algún mal, será bien cuando quisiéremos pedir alguna cosa por medio de esta Novena, disponernos para recibir el cuerpo de Jesucristo con una buena confesión. Esta se podrá hacer al principio de esta Novena, al medio o al fin de los nueve días, los que se podrán tomar contínuos o separados. Esta Novena se podrá hacer delante de cualquier estampa de Nuestra Señora de la Nueva, por la dificultad de ir a su ermita; y los que no pudieren en la Iglesia, podrán hacerla en sus casas. Su Divina Majestad nos conceda nuestras peticiones y después nos premie con su gloria. Amén.",
      comunTitle: "Oración común a todos los días",
      comunText: "Emperatriz Soberana de los cielos, Serenísima Reina de la tierra, Princesa de los espíritus angélicos, protectora de los pecadores; yo, la más vil criatura, postro mi corazón y mis sentidos ante vuestra milagrosa imágen soberana con el título precioso de la Nueva, y te suplico, como a depósito de las gracias que el Altísimo y Dios omnipotente concede al linaje humano, renueves y purifiques mis acciones con las aguas de tu liberal misericordia mediante esta milagrosa imágen, la cual quiesiste se apareciese derca de las cristalinas aguas del Alberche como símbolo de pureza. También te pido, Señora, separes mi alma de las compañías engañosas que ofrecen todas las cosas de este mundo, retirándola en soledad a la contemplación divina por medio de los trabajos y asperezas, sirviéndome de norte esta vuestra portentosa imágen, que quisiste se apareciese entre unos cerros, triunfando la soledad de vuestra gloria. Ultimamente te ruego, como a Hija escojida entre millares, del infinito poder, como a Madre del Unigénito Verbo y como a Esposa del Espíritu Divino, que presentes la petición de esta Novena en el tribunal de la infinita piedad de la Trinidad sagrada, para que logre lo que pido, si conviene; y si mi designio fuese errado, dadme dirección en mis deseos de todo aquello que ceda en mayor gloria de Dios, honra de la Santísima Trinidad, loor de la humanidad de nuestro señor Jesucristo, fruición de los habitadores celestiales, propagación de la santa fé católica, destrucción de todas las herejías, socorro de todos los desterrados en la tierra, y mayor bien de mi alma. Amén.",
      padreTitle: "Oración al eterno Padre",
      padreText: "O Altísimo, poderoso, grande y admirable Dios en todas las criaturas, pero con mayor grandeza en la creción del decoro y hermosura de todo el linaje humano, de la emulación santa de todos los espíritus angélicos, de la admiración del cielo y maravilla de nuestro grande poder, María, la Virgen pura; la que criaste cielo nuevo para que en él habitase tu Hijo amado. Sol con nuevos resplandores, para que iluminase a los vivientes, Luna para que las tinieblas de la culpa huyesen con los rayos de su gracia; Aurora para anunciarnos la venida del mejor Sol de Justicia; Estrella para ser segura guía del camino de la gloria; Norte para ser permanente siempre en gracia Mar para copiar casi inmensas perfecciones; nueva tierra para el sazonado fruto Jesucristo; Ciudad nueva, para descanso mayor de los mortales: yo, eterno soberano Dios, os alabo, magnífico y engrandezo por la formación de tan purísima criatura, que en vuestro infinito amor pesa más que todos los Ángeles y Santos, más que la hermosura de los cuelos y la tierra; yo te suplico por la intercesión de ese objeto de delicias, ilustres mi entendimiento y voluntad para que crea y confiese tu infinita perfección, y amándola constantemente, merezca conseguir lo que te pido en esta Novena, y después te goce para siempre. Amén.",
      salutacionTitle:"Salutación a María Santísima",
      salutacionText:"Dios te salve, María, Hija de Dios Padre; Dios te salve, María, Madre de Dios Hijo; Dios te salve, María; Esposa de Dios Espíritu Santo; Dios te salve, María, Templo y sagrario de la Santísima Trinidad; Dios te salve, María Santísima, concebida en gracia, sin mancha de pecado original, desde el primer instante de tu ser. Amén.",
      salutacionText2:"v. Ora pro nobis, Santa Dei Genitrix.",
      salutacionText3:"r. Ut digni efficiamur promissionibus Christi.",
      oremusTitle: "Oremus",
      oremusText: "Concede nos famulos tuos, quaesumus, Dómine Deus, perpetua mentis et corporis sanitate gaudere, et gloriosae Beatae Mariae semper Virginis intercessione, a praesenti liberari tristitia, et aeterna perfrui laetitia. Per Christum Dominum nostrum. Amén.",
      gozosTitle:"Gozos a María Santísima de la Nueva",
      gozosText:"O María celestial, O Madre, la mejor Eva;",
      gozosQuote:"Por tu imagen de la Nueva, Libranos de todo mal.",
      padreNuestro:"Padre Nuestro que...",
      aveMaria:"Dios te salve Maria..."
    }
  ];
  private concreta:Concreta[] = [
    {
      date: "31 Agosto",
      title: "Primero",
      subtitle: "Es María Cielo nuevo. (Apocal.21.)",
      text: "O milagro de la soberana omnipotencia, o imagen prodigiosa de la Nueva, que por tu altísima gracia mereciste llamarte cielo nuevo, por habitar en tu por nuevo modo el Unigénito Verbo del Altísimo, tomando en tus purísimas entrañas el vestido de nuestra naturaleza; yo te suplico por esta singular honra, que pues fuiste tabernáculo de la Bondad interminable cuyas perfecciones y atributos no se pueden comprender en lo criado, alcances de su divina Majestad se haga mi alma habitación del Espíritu Divino por medio de sus auxilios y gracias para que así participe de aquellos nuevos influjos del cielo de tu piedad, y consiga lo que especialmente te pido en esta Novena, si es del agrado de Dios y provecho de mi alma. Amén.",
      gozo: "Nueva fue tu aparición (Aunque antigua tu piedad). Para que en la soledad Triunfase tu intercesión: De gracias un gran caudal Esta copia tras sí lleva"
    },
    {
      date: "1 Septiembre",
      title: "Segundo",
      subtitle: "María Santísima Sol. (S. Albert. Magn.)",
      text: "¡O paloma candidísima de gracia! o nuevo ejemplo de pureza, que por singular criatura naciste como Sol refulgentísimo, comunicando tus luces a los hombres para que por ti lograsen divinas misericordias, la nueva vida de gracia, y por término la gloria; yo te alabo por tan singular escelencia, y te suplico comuniques tus influjos con el fruto de virtudes; y que tú como especial Sol, no hagas ausencia ni ocaso por la multitud de mis pecados, antes bien me asista tu intercesión perpetuamente para no ofender mas a la infinita bondad de nuestro Dios y Señor, y para que consiga lo que te pido en esta Novena, si es de la aceptación de su Divina Majestad, alabanza tuya y bien de mi alma. Amén.",
      gozo: "Tres mujeres a buscar Salieron tu imágen bella, Y las fue guía una estrella Hasta llegarla a encontrar: Su gloria tan sin igual No hay quien a expresar se atreva"
    },
    {
      date: "2 Septiembre",
      title: "Tercero",
      subtitle: "María Santísima Luna. (S. Bernard.)",
      text: "¡O celestial asombro de virtudes, o imágen portentosa de la Nueva! cuan liberal te muestras con los hombres comunicando las luces e influencias que como Luna hermosa participas del mejor Sol de Justicia, Jesucristo; por esto la dulzura de Bernardo te contemplaba Luna llena para recibir los dones, pero sobre muy crecida para comunicarlos a este mundo: yo te suplico por atributo tan digno de alabanza, que recibeas de la bondad increada los rayos de la divina caridad, y cual Luna sin menguantes los comuniques a mi alma, para que ame en todo y sobre todo al Divino por esencia, y por medio de tu incomparable hermosura consiga lo que te pido en esta Novena, siendo de la aceptación de Dios, gloria vuestra y provecho de mi alma. Amén.",
      gozo: "Entre cerros y asperezas En un zarzal prodigioso Estaba el retrato hermoso Y copia de tus grandezas; Felicísimo zarzal, Mucho esta dicha te eleva."
    },
    {
      date: "3 Septiembre",
      title: "Cuarto",
      subtitle: "María Santísima Aurora. (S Albert. Magn.)",
      text: "O prodigio estupendo de los Santos, o María, Princesa de los cielos que para lauro de tu soberanía fuiste la más hermosa Aurora que anunciaste la luz del día de la gracia, Jesucristo, pero con tal propiedad, que si la aurora material enjendra al mismo de quien recibe sus luces, también vos, escogida entre mujeres, eres Madre de nuestro amante Jesús, y eres Hija de su infinito poder: yo te doy mil enhorabuenas, y te pudo me levantes de mis yerros a la hora de tu luz, para ver la claridad eterna de mi Dios por interminables siglos, y que consiga la petición de esta Novena, si no sirviese deestorbo para ver la luz de Dios. Amén.",
      gozo: "El corriente cristalino De Alberche baña tu casa, Y por eso cuando pasa Pasa de humano a divino: De virtudes un raudal Cogerá quién en tí beba."
    },
    {
      date: "4 Septiembre",
      title: "Quinto",
      subtitle: "María Santísima Estrella. (S. Antón Flor)",
      text: "O María, digna de ser alabada desde tu primer orígen, en el que, como la mejor Estrella de los Magos, diste justa alegría a todo el orbe, por ser el más claro signo de que nació el Redentor de todo el linaje humano, y si en la Estrella de la adoración se llegó a conocer forma de un niño, con mucha más propiedad se estampó en tu vientre virginal el mejor Niño Jesús: yo magnifico tu grandeza, y te suplico imprimas en tu santísima voluntad la imágen de mi alma, para que se vista con el adorno de tu gracia, conozca la eficacia de los divinos auxilios y consiga lo que pido en esta Novena, si se contiene en la esfera de la voluntad de Dios. Amén.",
      gozo: "Cual Cielo nuevo se ostenta En aquella soledad, Tu generosa piedad Al que amante se presenta; Te muestras tan liberal Que no habrá quien no te deba."
    },
    {
      date: "5 Septiembre",
      title: "Sexto",
      subtitle: "María Santísima Norte. (S. Bern.)",
      text: "O María, Sagrario de grandeza, que para extensión de tu liberal piedad quisiste ser el Norte de todos los que navegamos en el mundo como mar de las miserias, para que llegásemos al puerto de la bienaventuranza, en donde gozan los habitadores celestiales delicias indecibles, viendo la Esencia Divina: yo te ruego, Madre de toda pureza, seas siempre el Norte de mi alma, para que salga con properidad de los naufragios, borrascas y peligros de este mundo que la nave de mis apetitos padece en este destierro, y llegue al puerto de la gloria; y al presente consiga lo que te suplico en esta Novena, si sirviese de remo en esta navegación. Amén.",
      gozo: "Cual un sol muy refulgente, Y cual luna muy lucida, Causas, Madre, nueva vida Cuando te miran patente. O sagrado manantial, Donde la sed mas se ceba."
    },
    {
      date: "6 Septiembre",
      title: "Séptimo",
      subtitle: "María Santísima Mar. (S. Bern.)",
      text: "O acueducto de los manantiales de la gracia, o María, mejor mar que el de las aguas, el que si explica las grandezas del Altísimo por tener congregados sus cristales sin encontrar el término a sus olas, no te iguala en la inmensidad de tus virtudes, en el conjunto de todas tus perfecciones, y en el logro de la misericordia de Dios: yo te suplico, por lo caudaloso del mar de tu piedad, que beba las aguas suyas, las que están sin la mezcla del salitre del pecado, para que amortiguën los impulsos sedientos de mis apetitos, y pueda conseguir lo que especialmente te pido en esta Novena, si fuese instrumento para limpiar el camino de estas aguas. Amén.",
      gozo: "Una estrella muy brillante. Un norte siempre seguro Se advierte en tu rostro puro, Con esplendor muy triunfante: Un gozo espiritual De tu cara siempre nueva."
    },
    {
      date: "7 Septiembre",
      title: "Octavo",
      subtitle: "María Santísima Tierra nueva. (Apocal. cap. 21.)",
      text: "O Reina de todo lo criado, o Señora en el cielo y en la tierra, que como honra de todo el linaje humano fuiste la tierra nueva primorosa en donde nació la mejor planta Jesús, estando tan labrada con la gracia, que aun el más leve asomo de culpa no se atrevió a manchar tu Concepción: yo te doy mil parabienes por escepción tan singular entre todos los que nacemos de la tierra manchada con la culpa, y te suplico labres mi alma con tu misericordia para que quites las raices de mis malas inclinaciones, fructifique virtudes, y haga buenas obras, por las que merezca conseguir lo que pido en esta Novena; si fuese justo. Amén.",
      gozo: "Nueva tierra y sin pecado Eres con grande primor, Donde la planta mejor Nació, Jesucristo amado: En gloria tan sustancial Todo discurso se eleva."
    },
    {
      date: "8 Septiembre",
      title: "Noveno",
      subtitle: "María Santísima Ciudad nueva. (Apocal. cap. 21.)",
      text: "O libertad de los cautivos en la culpa, o descanso de los fatigados en la tierra, que para premio de los justos eres nueva Ciudad, y Jerusalén triunfante, en la que está cifrada claramente una paz inviolable, seguridad sin medida, novedad maravillosa, y últimamente la gloria: yo te rindo adoraciones, Serenísima Madre de la Nueva, por esta elevación tan encumbrada, y te suplico me muestres el camino para tan santa Ciudad, y habite en ella por los siglos de los siglos, dándote incesables alabanzas, y al presente consiga lo que pido en esta Novena, con tal que no sirva de cerrarme las puertas de tan celestial Ciudad. Amén.",
      gozo: "Triunfante Jerusalén Y ciudad fortalecida Pareces, Madre querida. A todos los que te ven: O María celestial, O Madre, la mejor Eva."
    }
  ];
  getComun():Comun[]{
    return this.comun;
  }
  getConcreta():Concreta[]{
    return this.concreta;
  }
}

export interface Comun{
  instructions: string;
  instructions2: string;
  advertenciasTitle: string;
  advertenciasText: string;
  comunTitle: string;
  comunText: string;
  padreTitle: string;
  padreText: string;
  salutacionTitle: string;
  salutacionText: string;
  salutacionText2: string;
  salutacionText3: string;
  oremusTitle: string;
  oremusText: string;
  gozosTitle: string;
  gozosText: string;
  gozosQuote: string;
  padreNuestro: string;
  aveMaria: string;
};
export interface Concreta{
  date: string;
  title: string;
  subtitle: string;
  text: string;
  gozo: string;
};