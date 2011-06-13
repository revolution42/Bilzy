// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @warning_level QUIET
// @output_file_name default.js
// @externs_url http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.js
// ==/ClosureCompiler==
$(document).ready(function() {

	
	/*********************************************************************
	 * Functions to make things shorter
	 ********************************************************************/
	 function getFullYear(date)
	 {
		 return date.getFullYear();
	 }
	 
	 var br = '<br>';

	var body = $('body');
	

	/**
	 * @constructor
	 */
	function Cal(_month, _year, action) {
		var now = new Date(), month = (isNaN(_month) || _month == null) ? now.getMonth() : _month, year = (isNaN(_year) || _year == null) ? getFullYear(now) : _year, self = this;
		
		self.month = month;
		self.year = year;

		var html = '<table class="cal"><caption>' + Cal.months[month] + " " + year + '<thead><tr><th colspan="7"><tr>';
		
		for ( var i = 0; i <= 6; i++) {
			html += '<th>' + Cal.days[i];
		}
		html += '<tbody>';
		

		var table = $(html), nextBtn = $('<span>&#8667;</span>').click(function(){
			self.month++;
			if (self.month == 12) {
				self.month = 0;
				self.year++;
			}

			r();
		}), previousBtn = $('<span>&#8666;</span>').click( function()
		{
			self.month--;
			if (self.month == -1){
				self.month = 11;
				self.year--;
			}
			r();
			
		});
		
		
		$('th:first', table).append(previousBtn).append(nextBtn);

		genRow(year, month);
		
		this.e = table;
		action(self);
		
		// Replace table body and caption
		function r()
		{
			genRow(self.year, self.month);
			$('caption', table).html(Cal.months[self.month] + " " + self.year);
			action(self);
		}
		
		function genRow(_year,_month) {
			var firstDay = new Date(_year,_month, 1), startingDay = firstDay.getDay(), monthLength = Cal.daysInMonth[_month],tbody = $('tbody', table).empty(),day = 1,i=0, row = $('<tr>');
			
			// compensate for leap year
			(_month == 1 && ((_year % 4 == 0 && _year % 100 != 0) || _year % 400 == 0)) ? monthLength = 29 :'';
			tbody.append(row);
			
			while (day <= monthLength ) {
				for ( var j = 0; j <= 6; j++) {
					var td = $('<td>');
					row.append(td);
					if (day <= monthLength && (i > 0 || j >= startingDay)) {
						var classString = ' class="s ';
						if( (now.getMonth()) == _month && (getFullYear(now) == _year) && (now.getDate() == day) )
						{
							classString += ' today';
						}

						td.append($('<a' + classString + '">' + day++ + '</a>').data('date',new Date(_year + '/' + (_month+1) + '/' + (day-1))));						
					}
				}
				row = $('<tr>');
				tbody.append(row);
				i++;
			}

		};	
	}

	Cal.days = [ 'S', 'M', 'T', 'W', 'T', 'F', 'S' ];
	Cal.months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
	Cal.daysInMonth = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
	
	/**
	 * @constructor
	 */
	var ORM = function(tableName)
	{
		this.t = function(){ return tableName; };
	};

	ORM.prototype.save = function()
	{
		if( this.id === undefined || this.id == '' )
		{
			this.id = this.getNextIndex();
		}

		localStorage[this.t() + this.id] = JSON.stringify(this);
		refresh();
	};

	ORM.prototype.load = function(id)
	{
		var orm = this;
		$.each( JSON.parse(localStorage[this.t() + id]), function(key, val)
		{
			orm[key] = val;
		});
	};

	ORM.prototype.getNextIndex = function()
	{
		var indexList = ORM.indexList(this.t());
		
		var index = indexList[indexList.length - 1];

		if( index === undefined )
		{
			index = -1;
		}

		index++;
		indexList.push(index);
		localStorage[this.t() + '_i'] = JSON.stringify(indexList);

		return index;
	};

	ORM.indexList = function(table)
	{
		var index = localStorage[table + '_i'];

		if( index === undefined || index === null )
		{
			return [];
		}

		return JSON.parse(index);
	};

	ORM.list = function(tableName)
	{
		var list = [];

		$.each( ORM.indexList(tableName), function(i, index)
		{
			var o = new ORM(tableName);
			o.load(index);
			list.push(o);
		});

		return list;
	};
	
	ORM.prototype.deleteORM = function()
	{
		var id = this.id;
		var indexList = jQuery.grep(ORM.indexList(this.t()), function(value) {
	        return value != id;
	      });
		
		localStorage[this.t() + '_i'] = JSON.stringify(indexList);
	};

	/**a
	 * @constructor
	 */
	function Content(tableName, _fields)
	{

		var elem = $('<div>');
		var form = $('<form>');
		var header = $('<tr>');
		var table = $('<table class="l" border="1">').append(header);
		var add = $('<a class="add btn">Add New</a>');
		var afields = _fields;
		
		add.click(launchForm);
		
		this.elem = elem.append(add).append(table);
		
		function launchForm()
		{
			form.empty();
			buildForm();
			new Hover(form);
			
			form.submit(function()
			{
				var orm = new ORM(tableName);
					
				$(':input', form).each( function(i,v)
				{
					var element = $(v), name=element.attr('name'), value = element.val();
					orm[name] = value;
					element.val('');
				});
			
				orm.save();
			
				refresh();
					
				return false;
			});

		}

		buildForm(true);
		function buildForm(startup)
		{
		
		//
		// Build the form and table
		// ------------------------------------------------
		//
		for( var i = 0; i < afields.length; i++)
		{
			var field = afields[i];

			var headerText = field.name.replace('_', ' ');
			
			form.append('<label>' + headerText + '</label>');
			form.append(field.e());
			
			if( startup )
			{
				header.append('<th>' + headerText);
			}
		}
		form.append('<input type="hidden" name="id">');
				
		form.append('<button class="btn">Submit</button>');
		}
		var ormList = ORM.list(tableName);

		for( var i = 0; i < ormList.length; i++)
		{
			var orm = ormList[i];
			addRow(orm);		
		}
		
		function addRow(orm)
		{
			var row = $('<tr>');
			$.each(orm, function(col, val)
			{
				if( typeof val !== 'function' && col != 'id' && col != '' )
				{
					row.append('<td>' + types[col].dispay(val));
				}
			});
			
		
			row.append($('<td class="b">&#9998;</td>').click(function()
			{

				launchForm();
				
				$.each(orm, function(col, val)
				{
					if( typeof val !== 'function' )
					{
						$(':input[name="' + col + '"]', form).val(val);
					}
				});
			}));
			
			row.append($('<td class="b">x</td>').click(function()
			{
				orm.deleteORM();
				refresh();
			}));
			
			table.append(row);
		}
	};
	
var timeFrames = {
		weekly:'Weekly',
		fortnightly:'Fortnightly',
		monthly:'Monthly'
};

var types = {
		'name' : {
			e : function() {
				return $('<input name="name">');
			},
			'name' : 'name',
			dispay : basicDisplay
		},
		'category' : {
			
			
			e : function() {
				var list = ORM.list('category');
				var select = $('<select name="category">');
				for ( var i = 0; i < list.length; i++) {
					var val = list[i];
					select.append('<option value="' + val.id + '">' + val.name);
				}

				return select;
			},
			'name' : 'category',
			dispay : function(id) {
				var category = new ORM('category');
				category.load(id);
				return category.name;
			}
		},
		'amount': {
			e : function(){ return $('<input name="amount">');},
			'name' : 'amount',
			dispay : function(value){return '$' + value}
		},
		'timeFrame': {
			e : function(){ return $('<select name="timeFrame"><option>' + timeFrames.weekly + '</option><option>' + timeFrames.fortnightly + '</option><option>' + timeFrames.monthly + '</option>');},
			'name' : 'time_Frame',
			dispay : basicDisplay
		},
		'startTime': {
			e : function()
			{ 
				var e=$('<input name="startTime">'),c=new Cal(null,null,function(c)
					{
						$('td', c.e).click( function()
						{
							var q = $('a', this);
							var d = q.html();
							
							if( d != '' )
							{
								e.val(d + ' ' + $('caption', c.e).html());
							}
							
							c.e.hide();
						});
					});
				
				c.e.addClass('z');
				
				e.click( function()
				{
					var p = e.offset();
					body.append(c.e);
					c.e.css({
						position:'absolute',
						top: p.top + 25,
						left: p.left
					});
					c.e.slideDown();
					
					
				});
				return e;
			},
			'name' : 'start_Time',
			dispay : function(content){
				var date = new Date(content);
				return date.getDate() + ' ' + Cal.months[date.getMonth()] + ' ' + date.getFullYear();
			}
		}
	};



var content = {
	category : new Content('category', [ types.name ]),
	bill : new Content('bill', [ types['name'], types['category'], types['timeFrame'], types['startTime'], types['amount'] ])
};

/**
 * @constructor
 */
function Page(name, content)
{
	var cont = $('<div class="page s">');
	cont.append('<h1 class="s">' + name + '</h1>');
	cont.attr('id', name);
	
	if( content )
	{
		cont.append(content.elem);
	}

	this.nav = $('<li class="s" id="' + name + '_nav">' + name + '</li>');
	this.cont = cont;

	this.nav.click(function()
	{
		$('#nav .act').removeClass('act');
		$(this).addClass('act');
		
		$('.page').hide();
		cont.show();

		body.attr('class','');
		body.addClass(name);
		window.location.hash = name;
	});

	Page.nav.append(this.nav);
	Page.cont.append(this.cont);
};
Page.nav = $('<ul id="nav">');
Page.cont = $('<div id="c">');
	
	body.append(Page.cont);
	body.append('<div id="l"><div /><span>Bilzy</span></div>');
	Page.cont.append(Page.nav);
	
	new Page('Overview', {elem:function(){ 
		var cal =new Cal(null,null,function(e)
		{
			var monSplit = $('caption', e.e).html().split(' ');
			var month = Cal.months.indexOf(monSplit[0])+1;
			var year = monSplit[1];
			$('td a',e.e).each( function(i, td) 
			{
				td = $(td);
				var date = td.data('date');
				var billList = getBillsOnDate(date);
				
				var cost = 0;
				
				var hoverContent = $('<div>');
				for ( var j = 0; j < billList.length; j++)
				{
					var bill = billList[j];
					cost += parseInt(bill['amount'],10);
					hoverContent.append(bill['name'] + ' - $' + bill['amount'] + br);
				}
				
				var append = br + '&nbsp;';
				
				if( cost > 0 )
				{
					append = br + '$' + cost;
				}
				
				td.append(append);
				
				td.click( function()
				{
					hoverContent.prepend('<h2>' + date.getDate() + ' ' + Cal.months[date.getMonth()] + ' ' + getFullYear(date) + '</h2>');
					new Hover(hoverContent);
				});
			});
		});
		
		
		return cal.e;
	}()});
	
	new Page('Categories', content.category);
	
	new Page('Bills', content.bill);
	
	new Page('Reports', {elem:function(){ 
		var cont = $('<div>');
		cont.append(generateGraph());
		return cont;
	}()});
	
	function getBillsOnDate(testDate)
	{
		var returnArray = [];
		var dateList = ORM.list('bill');

		for ( var i = 0; i < dateList.length; i++)
		{
			var bill = dateList[i];
			var date = new Date(bill.startTime);
			var millisecondsInAWeek = 60*60*24*7*1000;

			if( testDate >= date )
			{
				switch( bill['timeFrame'] )
				{
					case timeFrames.weekly:
						
						if( !(((testDate-date)/millisecondsInAWeek) % 1) && (testDate >= date) )
						{
							returnArray.push(bill);
						}
						break;
						
					case timeFrames.fortnightly:
						if( !(((testDate-date)/(millisecondsInAWeek*2)) % 1) && (testDate >= date) )
						{
							returnArray.push(bill);
						}
						break;
						
					case timeFrames.monthly:
						if( (testDate.getDate() == date.getDate()) || (date.getDate() > Cal.daysInMonth[testDate.getMonth()] && testDate.getDate() == Cal.daysInMonth[testDate.getMonth()]) )
						{
							returnArray.push(bill);
						}
						break;
				}
			}
		}
		
		return returnArray;
	}



	/**
	 * @constructor
	 */
	function Hover(content)
	{
		content.addClass('h s');
		var overlay = $('<div class="o">');
		$('body').append(overlay);
		$('#c').append(content);
		content.fadeIn();
		overlay.fadeIn();

		overlay.click( function()
		{
			overlay.remove();
			content.remove();
			$('.z').remove();
		});
	}


	function basicDisplay(content) {
		return content;
	}

	function getCostOfMonth(month, year, category)
	{
		var daysInMonth = Cal.daysInMonth[month-1];
		var cost = 0;
		var strlen = 0;
		for ( var i = 1; i <= daysInMonth; i++)
		{
			var bills = getBillsOnDate(new Date(year + '/' + month + '/' + i));
			strlen += bills.length;
			for ( var j = 0; j < bills.length; j++)
			{
				var bill = bills[j];
				
				if( bill['category'] == category )
				{
					cost += parseInt(bill['amount'],10);
				}
			}
		}

		return cost;
	}
	
	function generateGraph()
	{
		var categoryList = '';
		var categoryValues = '';
		
		var chartMax = 0;
		var hexString = '';
		$.each(  ORM.list('category'), function(i, e)
		{
			var max = 0;
			categoryList += e['name'] + '|';
			
			for ( var l = 1; l <= 12; l++)
			{
				var val = getCostOfMonth(l, 2010, e.id);

				categoryValues += val + ',';

				if( val > max )
				{
					max = val;
				}
			}

			chartMax+=max;
			
			categoryValues = categoryValues.substr(0,categoryValues.length-1) + '|';
			hexString += Math.floor(Math.random()*16777215).toString(16) + ',';
		});

		var src = 'http://chart.apis.google.com/chart?chxl=0:|' + Cal.months.join('|') + '&chxr=0,0,11|1,0,' + chartMax + '&chxt=x,y&chbh=a&chs=620x420&cht=bvs&chco=' + trimLastChar(hexString) + '&chds=0,' + chartMax + ',0,' + chartMax + '&chd=t:' + trimLastChar(categoryValues) + '&chdl=' + trimLastChar(categoryList) + '&chtt=Expenses+2010';
		return $('<img>').attr('src', src);
	}
	
	function switchPage()
	{
		var hash = window.location.hash;

		if( hash == '' )
		{
			hash = '#Overview';
		}
		$(hash + '_nav',Page.nav).click();
	}
	
	function refresh()
	{
		location.reload(true);
	}
	
	function trimLastChar(string)
	{
		return string.substr(0,string.length-1);
	}
	
	window.onhashchange = switchPage;
	switchPage();
});