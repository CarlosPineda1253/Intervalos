/**
 * @author jcpineda
 */
$(document).ready(ini);
function ini(){
	//Variable que contiene la información del número de intervalos
	var num_intervals = 0;
	
	//Función inicial para crear el formulario de intervalos (número de intervalos)
	init_body();
	
	/*El primer form que tiene los datos de los intervalos no es necesario ir al servidor para crear
	 el formulario de ingreso de cada elemento de los intervalos, por eso se escucha el evento de submit*/
	$('body').on('submit', '#form-create', function(e) {
		e.preventDefault();
		
		//Se verifica que el número de intervalos no este vació
        if ($('#Num_Intervals').val() == ""){
			alert('Ningún campo puede estar vació');
			return;
		}
		
        //Se llama a la función para crear el formulario de ingreso de cada elemento de los intervalos
        num_intervals = create_input_intervals();
	});
	
	//Antes de enviar los datos de los intervalos al servidor, se transforman a JSON y se envían por AJAX
    $('body').on('submit', '#form-overlapping', function(e) {
		e.preventDefault();
		var jsonMatrix = Array();
		
        //Se leen todos los elementos de los intervalos
        for (i = 0; i < num_intervals; i++) {
			//Se crea un nuevo array dentro del array por cada intervalo
			jsonMatrix.push(new Array());
			for (z = 0; z < 2; z++){
				/*Se busca los elementos del HTML por el elemento correspondiente a cada elemento de los intervalos
				 donde i y z corresponden a su fila y columna, el elemento HTML tiene un id correspondiente al elemento
				 que representa del intervalo empezando con un Input[z][i], donde z es la columna y la i es la fila*/
				var num_row = i+1;
                var num_column = z;
                var value = $("#body").find("#Input" + num_row + num_column).val();
				
				//Se verifica que ningun elemento este vació
				if(value == ""){
					alert('Ningún campo puede estar vació');
	    			return;
				}
				
				//Se almacena el elemento en el array en el ultimo lugar, donde [i] es la fila y el push es la columna
				jsonMatrix[i].push(value);
			}
        }
		
		//AJAX, se envia por POST y en formato JSON el array antes creado, se espera como respuesta un JSON igualmente
		$.ajax({
			type: 'POST',   
            data: { Intervals: JSON.stringify(jsonMatrix)},
            dataType: "json",
            url:'/Home/overlapping',
			success: function (response) {
                //Se llama a la función para imprimir el resultado y los intervalos ingresados
                print_intervals(jsonMatrix, response);
			},
			error: function () {
				//Si hubo un error solo se le avisa al usuario que lo intente de nuevo
				alert('Error, intentalo nuevamente.');
			}
		});
	});
	
	//Evento para verificar que se introduzcan solamente numeros
	$('body').on('keydown', 'input', function(e) {
		e.preventDefault();
		//El valor que tiene el input(textbox) para poder modificarlo en caso de ser necesario
		var text_temp = $(this).val();
		
		//Si se presiona el backforward(borrar)
		if(e.keyCode == 8){
			//Se borra el ultimo elemento del string del textbox y regresamos
			text_temp = text_temp.slice(0, -1);
			$(this).val(text_temp);
			return;
		}
		
		//Si se presiona TAB
		if(e.keyCode == 9){
			//Cuanto elementos de input tipo texto existen
			var n = $("input:text").length;
			//Se obtiene el siguiente elemento input tipo texto
			var nextIndex = $('input:text').index(this) + 1;
			if(nextIndex < n){
				//Si existen más elementos se pone el cursor en el siguiente elemento
				$('input:text')[nextIndex].focus();
			}else{
				//Sino existe se deselecciona el elemento actual
				$('input:text')[nextIndex-1].blur();
			}
		}
		
		//Si la tecla no es un numero no se hace nada y regresamos
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        	return;
        }else{
        	//Si es un numero se añade al string que tenga el input(textbox)
        	text_temp += e.key;
        	$(this).val(text_temp);
        	return;
        }
	});
}

/*Función que inicia el formulario para ingresar el numero de intervalos*/
function init_body(){
	//Se crea el string con código HTML
	var code = '<form id="form-create" class="container" action="" method="POST">\
					<div class="center">\
						<h2 class="blue-text"> Intervalos </h2>\
					</div>\
					<div class="row">\
						<div class="col s8 m4 l4 offset-s2 offset-m4 offset-l4">\
							<div class="card-panel white s4 m2 l2">\
								<div class="input-field">\
									<input id="Num_Intervals" type="text" name="Num_Intervals">\
									<label for="Num_Intervals">Cantidad de intervalos</label>\
				            			</div>\
				            			<div class="row center">\
				            				<button class="btn waves-effect waves-light blue accent-4" name="submit_num_intervals" type="submit" id="Create_Intervals">Crear Intervalos\
				            					<i class="material-icons right">send</i>\
				            				</button>\
								</div>\
			            			</div>\
			        		</div>\
			    		</div>\
	        		</form>';
	//A la etiqueta en el HTML con id body se le pasa el HTML creado para su renderización en el browser
	$('#body').html(code);
}

/*Función para crear el layout del formulario para ingresar los datos de cada elemento del intervalo*/
function create_input_intervals(){
	//Se leen los datos que ingreso el usuario del número de intervalos			
    var num_intervals = $('#Num_Intervals').val();
    //Cantidad fija de columnas
    var num_colums = 2;
	
    //Se calcula los tamaños de los textbox de acuerdo a la cantidad que se tienen que dibujar
    var size_textinput = (screen.width / num_colums) - (num_colums * 2) - ((screen.width * 0.08) / num_colums);
	size_textinput = Math.round(size_textinput);
	
	//Se crea el form para hacer el submit con los datos de los elementos
    var code = '<form id="form-overlapping" action="" method="POST">\
					<div class="center">\
						<h2 class="blue-text"> Intervalos </h2>\
					</div>';
	//Se crean dinamicamente los input(textbox) y se les asigna un id unico para posteriormente identificarlos
    for (i = 0; i < 2; i++) {
        code += '<div class="input-field inline center">';
        for (z = 1; z <= Number(num_intervals); z++) {
            code += '<div class="input-field">';
            code += '<input id="Input' + z + i + '" type="text" name="Input' + z + i + '" style="width: ' + size_textinput + 'px;" />';
            if (i == 0) {
                code += '<label for="Input' + z + i + '">Intervalo ' + z + ' Min </label>';
            } else {
                code += '<label for="Input' + z + i + '">Intervalo ' + z + ' Max </label>';
            }
            
            code += '</div>';
        }
        code += '</div>';
    }
	//Se crea el botón para hacer el traslapado de los intervalos
	code += '		<div class="row center">\
    					<button class="btn waves-effect waves-light blue accent-4" name="submit_intervals" type="submit" id="Overlapping_Intervals">Traslapar Intervalos\
							<i class="material-icons right">send</i>\
        				</button>\
					</div>\
				</form>';
	$('#body').html(code);

    return num_intervals;
}

/*Función para imprimir los intervalos*/
function print_intervals(intervals_input, intervals_output) {
    var num_colums = 2;

    //Se calcula los tamaños de los textbox de acuerdo a la cantidad que se tienen que dibujar
    var size_textinput = (screen.width / (num_colums*4)) - ((screen.width * 0.18) / num_colums);
    size_textinput = Math.round(size_textinput);

	//Se crea el form para regresar al ingreso de número de intervalos
	var code = '<form id="form-return" action="" method="POST">\
					<div class="center">\
						<h5 class="blue-text"> Intervalos ingresados </h5>\
					</div>';
    //Se lee cada intervalo que se introdujo para mostrarlo como un label
    $.each(intervals_input, function (key, value) {
        code += '<div class="inline center">';
        code += '<label class="center" style="font-size:' + size_textinput + 'px;">(';
        $.each(value, function (element) {
            code += value[element];
            if (element == 0) {
                code += ',';
            }
        });
        code += ')</label>';
        code += '</div>';
    });
	code += 		'<div class="center">\
						<h5 class="blue-text"> Intervalos traslapados </h5>\
					</div>';
	
    //Se lee cada elemento que nos regreso el servidor en forma de JSON teniendo en cuenta que es de 2 dimensiones
    $.each(intervals_output, function (key, value) {
		code += '<div class="inline center">';
        code += '<label class="center" style="font-size:' + size_textinput + 'px;">(';
		$.each(value, function(element){
            code += value[element];
            if (element == 0) {
                code += ',';
            }
		});
		code += ')</label>';
		code += '</div>';
	});
	
	//Se crea el botón para regresar al ingreso de número de intervalos
	code += '		<div class="row center">\
    					<button class="btn waves-effect waves-light blue accent-4" name="submit_return" type="submit" id="Return">Regresar\
							<i class="material-icons right">send</i>\
        				</button>\
					</div>\
				</form>';
	//A la etiqueta en el HTML con id body se le pasa el HTML creado para su renderización en el browser
	$('#body').html(code);
}
