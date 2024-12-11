import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "prop": function() {
        return prop;
    },

    "Component": function() {
        return Component;
    }
});

import "/node_modules/@zoho/lyte-ui-component/components/helpers/helpers-dev.js";
import "/node_modules/@zoho/lyte-ui-component/components/javascript/lyte-dropdown.js";
import { prop } from "/node_modules/@slyte/core/index.js";
import { Component } from "/node_modules/@zoho/lyte-ui-component/components/component.js";

import $L from "/node_modules/@zoho/lyte-dom/modules/lyte-dom-utils.js";

import "/node_modules/@zoho/lyte-ui-component/components/javascript/lyte-tooltip.js";

import "/node_modules/@zoho/lyte-ui-component/plugins/lyte-moment-basic.js";
import "/node_modules/@zoho/lyte-ui-component/plugins/lyte-moment-additional.js";

/**
 * Renders a calendar
 * @component lyte-calendar
 * @version 1.0.0
 * @utility revertToToday,revertToSelected
 * @methods onDateSelected,onNavigate,onViewChange
 * @dependencies lyte-dropdown
 */

class LyteCalendarComponent extends Component {
    constructor() {
        super();
    }

    data(arg1) {
		return Object.assign(super.data({
			'ltPropStartDate': prop('string', {
				'default': ''
			}),
			'ltPropEndDate': prop('string', {
				'default': ''
			}),

			/**
			 * @componentProperty {dateString} ltPropCurrentDate
			 */

			'ltPropCurrentDate': prop( 'string', { 
				'default': '' 
			} ),
			/** 
			 * @typedef {
				* MM/DD/YYYY |
				* YYYY/MM/DD |
				* MMM/DD/YYYY |
				* MMM/YYYY/DD |
				* DD/MMM/YYYY |
				* YYYY/MMM/DD |
				* DD/YYYY/MMM |
				* YYYY/DD/MMM |
				* MMMM/DD/YYYY |
				* MMMM/YYYY/DD |
				* DD/YYYY/MMMM |
				* YYYY/DD/MMMM |
				* DD/MMMM/YYYY |
				* YYYY/MMMM/DD
				* } dateFormat
			*/
			/**
			 * @componentProperty {dateFormat} ltPropFormat
			 * @default MM/DD/YYYY
			 */

			'ltPropFormat': prop( 'string', { 
				'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-calendar', 'format', 'MM/DD/YYYY' )  
			} ),

			/**
			 * @componentProperty {boolean} ltPropYear
			 * @default false
			 * 
			 */

			'ltPropYear': prop( 'boolean', { 
				'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-calendar', 'year', false ) 
			} ),

			/**
			 * @typedef {
			 * 'MMMM YYYY' |
			 * 'MMM YYYY'
			 * } MonthHeaderFormat
			 */
			/**
			 * @componentProperty {MonthHeaderFormat} ltPropMonthHeaderFormat
			 * @default 'MMMM YYYY'
			 */

			'ltPropMonthHeaderFormat': prop( 'string', { 
				'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-calendar', 'monthHeaderFormat', 'MMMM YYYY' ) 
			} ),
			'daysOfWeek': prop( 'array', { 
				'default': [] 
			} ),

			'ariaMonthNames': prop( 'array', { 'default': [
					'January',
					'February',
					'March',
					'April',
					'May',
					'June',
					'July',
					'August',
					'September',
					'October',
					'November',
					'December' 
			] } ),

			'monthSystemValues': prop( 'array', {
				'default': [
					'January',
					'February',
					'March',
					'April',
					'May',
					'June',
					'July',
					'August',
					'September',
					'October',
					'November',
					'December'
				]
			}),

			'monthNames': prop( 'array', { 
				'default': [
					'January',
					'February',
					'March',
					'April',
					'May',
					'June',
					'July',
					'August',
					'September',
					'October',
					'November',
					'December'
				]
			} ),
			'shortHands': prop( 'array', { 
				'default': [
					'Jan',
					'Feb',
					'Mar',
					'Apr',
					'short.may',
					'Jun',
					'Jul',
					'Aug',
					'Sep',
					'Oct',
					'Nov',
					'Dec'
				]
			} ),
			'todayName': prop( 'string', {
				'default': 'Today' 
			} ),
			'viewDate': prop( 'object', { 
				'default': {} 
			} ),
			'changeData': prop( 'number', {
				'default': 0 
			} ),

			/**
			 * @componentProperty {boolean} ltPropYield
			 * @default false
			 *
			 */

			'ltPropYield': prop( 'boolean', { 
				'default': false
			}),

			/**
			 * @componentProperty {dateString} ltPropMinDate
			 */

			'ltPropMinDate': prop( 'string', { 
				'default': ''
			}),

			/**
			 * @componentProperty {dateString} ltPropMaxDate
			 */

			'ltPropMaxDate': prop( 'string', { 
				'default': '' 
			} ),

			/**
			 * @componentProperty {number} ltPropStartWeekDay
			 * @default 1
			 * @minValue 0
			 * @maxValue 6
			 * @step 1
			 */

			'ltPropStartWeekDay': prop( 'number', { 
				'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-calendar', 'startWeekDay', 1 )
			} ),
			'navYield': prop( 'boolean', { 
				'default': false 
			} ),
			'selectDate': prop( 'boolean', { 
				'default': true 
			} ),
			'currentDatechanged': prop( 'number', { 
				'default': 0 
			} ),

			/**
			 * @componentProperty {boolean} ltPropFillRows
			 * @default true
			 * @version 1.0.2
			 *
			 */

			'ltPropFillRows': prop( 'boolean', { 
				'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-calendar', 'fillRows', true ) 
			} ),

			/**
			 * @componentProperty {number} ltPropNumberOfRows
			 * @version 1.0.2
			 * @default 6
			 */

			'ltPropNumberOfRows': prop( 'number', { 
				'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-calendar', 'numberOfRows', 6 )
			} ),
			'callFrmDidcnct' : prop('boolean',{"default" : false}),
			'monthDD' : prop("object"),
			'yearDD' : prop("object"),
			'years' :prop("array",{"default":[]}),

			/**
			 * @componentProperty {default|dropdown|drilldown} ltPropHeaderType
			 * @default default
			 * @version 1.0.2
			 */

			'ltPropHeaderType' : prop( "string", { "default": window._lyteUiUtils.resolveDefaultValue( 'lyte-calendar', 'headerType', 'default' ) } ),

			'ltPropDropdown': prop( 'object', { 'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-calendar', 'dropdown', 
				{
					'callout': true
				} 
			) } ),

			'cords': prop( 'object', { default: {} } ),
			'start': prop( 'number' ),
			'prev': prop( 'boolean' ),
			'tt': prop( 'boolean', { 'default': true } ),
			'showToday': prop( 'boolean', { 'default': true } ),

			'monthViewTableArray': prop( 'array', { 'default': [] } ),

			'ltPropBodyYield': prop( 'boolean', { 'default': false } ),

			'ltPropShowToday': prop( 'boolean', { 'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-calendar', 'showToday', true ) } ),

			'ltPropI18n': prop( 'boolean', { 'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-calendar', 'I18n', false ) } ),

			'ltPropActivateNavigation': prop( 'boolean', { 'default': false } ),

			// This attribute is only relevant for dateView
			'ltPropDisableNavigation': prop( 'boolean', { 'default': false } ),

			/* A team uses this but we are not goint to expose this outside */
			'ltPropPreventAddingRows': prop( 'boolean', { 'default': false } ),

			'ltPropSelectionType': prop( 'string', { 'default': 'day' } ),

			'ltPropWeekends': prop( 'array', { 'default': [ 6, 0 ] } ),

			'ltPropCurrentWeek': prop( 'array', { 'default': [] } ),

			'ltPropCurrentMonth': prop( 'string', { 'default': '' } ),

			'ltPropCurrentYear': prop( 'string', { 'default': '' } ),

			'ltPropDisabledDates': prop( 'array', { 'default': [] } ),

			'ltPropCurrentDates': prop( 'array', { 'default': [] } ),

			'ltPropMultiple': prop( 'boolean', { 'default': false } ),

			'headerId': prop( 'string' ),

			'monthDropdownId': prop( 'string' ),
			
			'yearDropdownId': prop( 'string' ),

			'ltPropIso' : prop( 'string'  ),

			'ltPropWeekNumCriteria': prop( 'number', { 'default': 1 } ),

			'ltPropHolidays': prop( 'array', { 'default': [ ] } ),

			'ltPropDisableWeekends': prop( 'boolean', { 'default': false } ),

			'ltPropDisableHolidays': prop( 'boolean', { 'default': false } ),

			'ltPropWeekNumber': prop( 'boolean', { 'default': false } ),

			//showToday even when we are in current date
			'ltPropAlwaysShowToday': prop( 'boolean', { 'default': false } ),

			'ltPropHighlightWeekendHolidays': prop( 'boolean', { 'default': false } ),

			'ltPropTimeZone' : prop( 'string' ),

			'ltPropDisabledDays' : prop( 'array', { default : window._lyteUiUtils.resolveDefaultValue( 'lyte-calendar', 'disabledWeekDays', [] ) } ),

			'ltPropHeaderAlignType': prop( 'string', { 'default': '' } ),

			'ltPropWeekNumHeader': prop( 'string', { 'default': '' } ),

			'showYear': prop( 'boolean', { 'default': false } ),

			'ltPropCurrentDisplayMonth': prop( 'string', { 'default': '' } ),

			'ltPropCurrentDisplayYear': prop( 'string', { 'default': '' } ),

			'ltPropCurrentDisplayDecade': prop( 'string', { 'default': '' } )
		}), arg1);
	}

    getCells() {
		var container = this.getTableContainer(),
			rows = container.children, cells = [];

		Array.from(rows).forEach(function (row) {
			cells = cells.concat(Array.from(row.children));
		});

		return cells;
	}

    getTableContainer() {
		return this.$node.querySelector( '.lyteCalTableRowGroup' );
	}

    moveForward(event, navDirection, cellsToMove) {
		this.move( event, navDirection, cellsToMove );
	}

    moveBackward(event, navDirection, cellsToMove) {
		this.move( event, navDirection, cellsToMove );
	}

    move(event, navDirection, cellsToMove) {
		var activeCell = this.getActiveCell(),
			cells = this.getCells(),
			currentNavIndex = cells.indexOf(activeCell),
			newNavIndex = currentNavIndex + cellsToMove,
			newActiveCell;

		if (!activeCell) {
			return;
		}

		if (!this.shouldViewChange(cells, newNavIndex, cellsToMove)) {
			newActiveCell = this.getCellFromSameView(cells, newNavIndex);
		}
		else {
			newActiveCell = this.getCellFromDifferentView(navDirection, currentNavIndex, cellsToMove, event);
		}

		this.activateCell(newActiveCell);
		this.focusActiveCell();
	}

    getCellFromSameView(cells, index) {
		return cells[ index ];
	}

    focusActiveCell() {
		var activeCell = this.getActiveCell();

		if (activeCell) {
			activeCell.focus();
		}
	}

    focusActiveRow() {
		var activeRow = this.getActiveRow();
		if( activeRow ) {
			activeRow.focus();
		}
	}

    shouldViewChange(cells, newNavIndex, cellsToMove) {
		var viewType = this.getData( 'viewType' );

		if (viewType === 'monthView' || viewType === 'decadeView') {
			return !cells[newNavIndex];
		}

		return !this.isSameMonth( cellsToMove );
	}

    isDisabledCell(cell) {
		return cell.classList.contains( 'lyteCalDisabled' )
	}

    getCellFromDifferentView(navDirection, currentNavIndex, cellsToMove, event) {
		var viewType = this.getData( 'viewType' ), newActiveDate;

		if (viewType === 'monthView' || viewType === 'decadeView') {
			this.changeView(navDirection);

			return this.getDrillDownViewCell(navDirection, currentNavIndex, cellsToMove);
		}


		newActiveDate = this.getChangedDate(cellsToMove);
		this.changeView(navDirection);

		return this.getCell( newActiveDate );
	}

    getDrillDownViewCell(navDirection, currentNavIndex, cellsToMove) {
		var cells = this.getCells();

		return navDirection === 'previous' ? cells[ cells.length + ( currentNavIndex + cellsToMove ) ] : cells[ ( currentNavIndex + cellsToMove ) % cells.length ]
	}

    changeView(navDirection) {
		if( navDirection === 'previous' ) {
			this.moveToPrevious( 'M', window.event );	
		}
		else {
			this.moveToNext( 'M', window.event );
		}
	}

    moveToFirstCell(event, navDirection) {
		var actionType = 'home',
			cellsToMove = this.getCellsToMove(navDirection, actionType);

		this.moveBackward( event, navDirection, cellsToMove );
	}

    moveToLastCell(event, navDirection) {
		var actionType = 'end', 
		cellsToMove = this.getCellsToMove( navDirection, actionType );

		this.moveForward( event, navDirection, cellsToMove );
	}

    getCellsToMove(navDirection, actionType) {
		var activeCell = this.getActiveCell(),
			parentElement = (activeCell || {}).parentElement,
			children = Array.from((parentElement || {}).children || []),
			index = children.indexOf(activeCell), viewType = this.getData('viewType');

		if (!activeCell) {
			return 0;
		}

		if (actionType === 'home' || actionType === 'end') {
			return navDirection === 'previous' ? -index : (children.length - 1 - index);
		}

		if (viewType === 'monthView' || viewType === 'decadeView') {
			return navDirection === 'previous' ? -4 : 4;
		}

		return navDirection === 'previous' ? -7 : 7;
	}

    getCell(date) {
		return this.$node.querySelector( '[data-date="' + date + '"]' );
	}

    isSameMonth(daysToChange) {
		var changedMonth = this.getChangedMonth( daysToChange ),
		viewDate = this.getData( 'viewDate' ),
		currentViewedMonth = viewDate.getMonth();
		
		return changedMonth === currentViewedMonth;

	}

    getChangedMonth(daysToChange) {
		var changedDate = this.getChangedDate( daysToChange ),
		format = this.getData( 'ltPropFormat' );

		return $L.moment( changedDate, format ).format( 'M' ) - 1;
	}

    // Assume activeCell will always return a valid cell
    getChangedDate(daysToChange) {
		var activeCell = this.getActiveCell(),
			activeDate = activeCell.getAttribute('data-date'),
			format = this.getData('ltPropFormat');

		return $L.moment( activeDate, format ).add( daysToChange, 'day' ).format( format );
	}

    previousNavigation(MONTH, event) {
		var YEAR = 'Y', MONTH = 'M', 
		navigationType = event.shiftKey ? YEAR : MONTH;

		this.moveToPrevious(navigationType, event);
		this.focusActiveCell();
	}

    nextNavigation(MONTH, event) {
		var YEAR = 'Y', MONTH = 'M', 
		navigationType = event.shiftKey ? YEAR : MONTH;

		this.moveToNext(navigationType, event);
		this.focusActiveCell();
	}

    toDate() {

		var comp_timezone = this.data.ltPropTimeZone;

		if( comp_timezone != void 0 ){
			return new Date( $L.moment().timezone( comp_timezone ).format( 'MM/DD/YYYY' ) );
		}

		if( this.isHavingTimezone ){
			return new Date( $L.moment().format( 'MM/DD/YYYY' ) );
		}
		return new Date();
	}

    moment(arg1, arg2, arg3) {
		var timezone = this.isHavingTimezone;
		if (timezone) {// for test case failure
			if (arg3) {
				arg3.ignore_timezone = timezone;
			} else {
				arg3 = { ignore_timezone: timezone };
			}
			return $L.moment(arg1, arg2, arg3);
		} else {
			if (arg2) { // for test case failure
				if (arg3) { // for test case failure
					return $L.moment(arg1, arg2, arg3);
				}
				return $L.moment(arg1, arg2);
			}
			return $L.moment(arg1);
		}
	}

    setShowYearAccToView() {
		var viewType = this.getData( 'viewType' );
		var showYear = this.getData( 'ltPropYear' );

		if( viewType === 'dateView' ) {
			if( showYear ){
				this.setData('showYear',true);
			}
			else{
				this.setData('showYear',false);
			}
		}
		else if( viewType === 'monthView' ) {
			this.setData('showYear',false);
		}
		else if( viewType === 'decadeView' ) {
			this.setData('showYear',false);
		}
	}

    removeSelectionStyles() {
		var container = this.$node.querySelector( '.lyteCalTableContainer' );

		container.classList.remove( 'lyteCalDaySelType' );
		container.classList.remove( 'lyteCalWeekSelType' );
		container.classList.remove( 'lyteCalMonthSelType' );
		container.classList.remove( 'lyteCalYearSelType' );
	}

    changeDaysOfWeek() {
		var days = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ], 
		title = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
		startDay = this.getData( 'ltPropStartWeekDay' ), i, result = [] ;
		var weekend = this.getData('ltPropWeekends');

		for( i = 0; i < 7; i++ ) { 
			var resClass = 'lyteCalTableCellHeader';
			var isWeekendHeader = weekend.indexOf( ( i + startDay ) % 7 ) === -1 ? false : true;
			if( isWeekendHeader ){
				resClass += ' lyteCalWeekendHeader'
			}

			result.push( { 'day': days[ ( i + startDay ) % 7 ], 'id': this.generateRandomId() , 'title': title[ ( i + startDay ) % 7 ], 'class': resClass } );

		}

		this.setData( 'daysOfWeek', result );
		
	}

    generateRandomId() {
		return 'Lyte_Calendar_Day_' + window._lyteUiUtils.calId++;
	}

    isYYFormat() {
		var format = this.getData( 'ltPropFormat' ),
		rYY = /\byy\b/ig;

		return rYY.test( format );
	}

    outsideBoundary(calStartDate) {
		var calculatedYear = calStartDate.getFullYear(),
			current = this.toDate(),
			currentYear = current.getFullYear(),
			diff = calculatedYear - currentYear,
			dateBounds = this.isMomentSupported ? $L.moment() : { uL: 19, lL: 80 };

		if (diff > dateBounds.uL) {
			return true;
		}
		else if (diff < -dateBounds.lL) {
			return true;
		}	
		
	}

    didDestroy() {
		delete this.$node.revertToToday;
	}

    activateRelevantCell() {
		var format = this.getData( 'ltPropFormat' ),
		curDate = this.stringToDate( this.getData( 'ltPropCurrentDate' ), format ),
		todayDate = this.toDate(), 
		previousActiveDate = this.stringToDate( this.getData( 'previousActiveCellDate' ), format ), relevantCell;

		if( previousActiveDate !== 'Invalid Date' ) {
			relevantCell = this.findSimilarCell( previousActiveDate );
		}

		if( curDate !== 'Invalid Date' ) {
			relevantCell = relevantCell || this.findSimilarCell( curDate );
		}

		relevantCell = relevantCell || this.findSimilarCell( todayDate );

		this.activateCell( relevantCell );
	}

    findSimilarCell(userDateObj) {
		var userDate = userDateObj.getDate(),
			currentViewedDateObj = this.getData('viewDate'),
			currentViewedMonth = currentViewedDateObj.getMonth(),
			currentViewedYear = currentViewedDateObj.getFullYear(),
			userMonth = userDateObj.getMonth(),
			numberOfDaysInMonth = this.getNumber(currentViewedMonth, currentViewedYear),
			format = this.getData('ltPropFormat'),
			resultDate, resultDateObj, resultDateString;

		resultDate = userDate > numberOfDaysInMonth ? numberOfDaysInMonth : userDate;
		resultDateObj = new Date(currentViewedMonth + 1 + '/' + resultDate + '/' + currentViewedYear);
		resultDateString = this.getDateFromFormat(resultDateObj, format);

		return this.getCell( resultDateString );
	}

    activateCell(cell) {

		if (!cell) {
			return;
		}

		var previousCell = this.$node.querySelector('.lyteCalNavCell');

		if (previousCell) {
			previousCell.classList.remove('lyteCalNavCell');
			previousCell.setAttribute('tabindex', '-1');
		}

		cell.setAttribute('tabindex', '0');
		cell.focus();
		cell.classList.add( 'lyteCalNavCell' );
		
		this.setData( 'previousActiveCellDate', cell.getAttribute( 'data-date' ) );
	}

    getActiveCell() {
		return this.$node.querySelector( '.lyteCalNavCell' );
	}

    getActiveRow() {
		var par =  this.$node.querySelector( '.lyteCalToday' ); //gives undefined !?
		return $L( par ).closest('lyteCalTableRow')[0];
	}

    removeOutOfRangeOption() {
		var years = this.getData( 'years' ),
		index;

		if( !isNaN( this.addedOption ) ) {
			index = years.indexOf( this.addedOption );

			if( !!~index ) {
				this.$addon.arrayUtils( years, 'removeAt', index );
				this.addedOption = null;
			}
		}
	}

    outOfRange(val) {
		if( val < 1900 || val > 2100 ) {
			return true;
		}

		return false;
	}

    addOutOfRangeOption(val) {
		var years = this.getData( 'years' );

		this.addedOption = val;

		if( val < 1900 ) {
			this.$addon.arrayUtils( years, 'insertAt', 0, val );
		}
		else if( val > 2100 ) {
			this.$addon.arrayUtils( years, 'push', val );
		}
	}

    getMonthHeader() {
		var format = this.getData( 'ltPropMonthHeaderFormat' ), 
		lmd = /MMMM YYYY/ig,
		ld = /MMM YYYY/ig,
		retval = "", monthArray;

		if( lmd.test( format ) ) {
			monthArray = this.getData( 'monthNames' )
			retval = window._lyteUiUtils.i18n( monthArray[ this.getData( 'viewDate' ).getMonth() ] ) + " " + this.getData( 'viewDate' ).getFullYear();
		}
		else if( ld.test( format ) ) {
			monthArray = this.getData( 'shortHands' )
			retval = window._lyteUiUtils.i18n( monthArray[ this.getData( 'viewDate' ).getMonth() ] ) + " " + this.getData( 'viewDate' ).getFullYear();
		}

		return retval;
	}

    revert(event) {
		var from = new Date( this.getData( 'viewDate' ).getTime() ), 
		curDate = this.toDate();


		curDate.setDate(1);

		var to = new Date(curDate.getTime());

		this.setData( 'viewDate', curDate );
		this.setAndBuildView( 'dateView', event );
		if( !this.getData('ltPropAlwaysShowToday') ){
			this.setData('showToday',false);
		}
		if( this.getMethods( 'onNavigate' ) 
			&& ( from.getMonth() !== to.getMonth() 
			|| from.getFullYear() !== to.getFullYear() ) 
		) {
			this.executeMethod('onNavigate', event, this.getDateFromFormat(from, this.getData('ltPropFormat')), this.getDateFromFormat(to, this.getData('ltPropFormat')), this);
		}
	}

    revertToMonth(event) {
		var from = new Date( this.getData( 'viewDate' ).getTime() ), 
		curDate = this.toDate();


		curDate.setDate(1);

		var to = new Date( curDate.getTime() );

		this.setData( 'viewDate', curDate );
		this.setAndBuildView( 'monthView', event );
		if( !this.getData('ltPropAlwaysShowToday') ){
			this.setData('showToday',false);
		}
		if( this.getMethods( 'onNavigate' ) 
			&& ( from.getMonth() !== to.getMonth() 
			|| from.getFullYear() !== to.getFullYear() ) 
		) {
			this.executeMethod( 'onNavigate', event, this.getDateFromFormat( from, this.getData( 'ltPropFormat' ) ), this.getDateFromFormat( to, this.getData( 'ltPropFormat' ) ) ,this );
		}
	}

    revertToYear( event ) {
		var from = new Date( this.getData( 'viewDate' ).getTime() ), 
		curDate = this.toDate();


		curDate.setDate(1);

		var to = new Date( curDate.getTime() );

		this.setData( 'viewDate', curDate );
		this.setAndBuildView( 'decadeView', event );
		if( !this.getData('ltPropAlwaysShowToday') ){
			this.setData('showToday',false);
		}

		var fromDecade = (from.getFullYear()+'').slice(0,3);
		var toDecade = (to.getFullYear()+'').slice(0,3);

		if( this.getMethods( 'onNavigate' ) 
			&& (  fromDecade !== toDecade ) 
		) {
			this.executeMethod( 'onNavigate', event, this.getDateFromFormat( from, this.getData( 'ltPropFormat' ) ), this.getDateFromFormat( to, this.getData( 'ltPropFormat' ) ) ,this );
		}
	}

    getDateFromFormat(dateObj, format) {
		if( this.isMomentSupported ) {
			return this.getDateStringFromMoment( dateObj, format );
		}
		else {
			return this.getDateStringManually(dateObj, format);
		}
	}

    getDateStringFromMoment(dateObj, format) {
		format = this.getRelevantFormat( format );

		return this.moment( dateObj ).format( format );
	}

    resolveConflicts(format) {
		var match = /(\bd\b|\bdd\b|\bddd\b|\bdddd\b)/.exec( format ),
		index = ( match || {} ).index,
		matchLength = ( match || [] )[ 0 ].length || 0;

		if (!isNaN(index)) {
			return format.substring(0, index + matchLength) + (format.substring(index + matchLength) || '').toUpperCase();
		}

		return format.toUpperCase();
	}

    isConflictingFormat(format) {
		var rdate = /(\bd\b|\bdd\b|\bddd\b|\bdddd\b)/ig,
			match = format.match(rdate) || [];

		return match.length > 1;
	}

    getRelevantFormat(format) {

		if (this.isConflictingFormat(format)) {
			return this.resolveConflicts(format);
		}

		return format.toUpperCase();
	}

    getDateStringManually(dateObj, format) {
		var date = dateObj.getDate(), year = dateObj.getFullYear(), month = dateObj.getMonth() + 1, monthArray,
			sd = /(MM).+(DD).+(YYYY)/ig,
			dmy = /(DD).+(MM).+(YYYY)/ig,
			ld = /(MMM|DD|YYYY).+(MMM|DD|YYYY).+(YYYY|MMM|DD)/ig,
			lmd = /(MMMM|DD|YYYY).+(MMMM|DD|YYYY).+(YYYY|MMMM|DD)/ig,
			iso = /(YYYY).+(MM).+(DD)/ig;

		format = format.toUpperCase();

		if (month < 10) {
			month = '0' + month
		}

		if (date < 10) {
			date = '0' + date
		}

		if (lmd.test(format)) {
			monthArray = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			]
			format = format.replace('MMMM', monthArray[month - 1]);
			format = format.replace('DD', date);
			format = format.replace('YYYY', year);
		}
		else if (ld.test(format)) {
			monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			format = format.replace('MMM', monthArray[month - 1]);
			format = format.replace('DD', date);
			format = format.replace('YYYY', year);
		}
		else if (iso.test(format)) {
			format = format.replace('MM', month);
			format = format.replace('DD', date);
			format = format.replace('YYYY', year);
		}
		else if (sd.test(format)) {
			format = format.replace('MM', month);
			format = format.replace('DD', date);
			format = format.replace('YYYY', year);
		}
		else if (dmy.test(format)) {
			format = format.replace('MM', month);
			format = format.replace('DD', date);
			format = format.replace('YYYY', year);
		}

		return format
	}

    isLeapYear(year) {
		return ( ( year % 4 == 0 ) && ( year % 100 != 0 ) ) || ( year % 400 == 0 );
	}

    getNumber(month, year) {
		var daysinmonths = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
		if( this.isLeapYear.call( this, year ) && month == 1 ) {
			return 29;
		}
		else {
			return daysinmonths[month];
		}
	}

    showtoday() {
		var curDate = this.toDate();

		if (curDate.getMonth() != this.getData('viewDate').getMonth() || curDate.getYear() != this.getData('viewDate').getYear()) {
			this.setData('showToday', true);
		}
		else {
			this.setData('showToday', false);
		}

		if( this.getData('ltPropAlwaysShowToday') ){
			this.setData( 'showToday', true);
		}

	}

    reset(cur) {
		cur.setHours( 0 );
		cur.setMinutes( 0 );
		cur.setSeconds( 0 );
		cur.setMilliseconds( 0 );
	}

    isInRange(current, start, end) {
		var startDate, endDate;

		this.reset(current);

		if (start === '' && end === '') {
			return true;
		}
		else if (start !== '' && end === '') {
			startDate = this.stringToDate(start, this.getData('ltPropFormat'));
			this.reset(startDate);

			if (current >= startDate) {
				return true;
			}
		}
		else if (start !== '' && end !== '') {
			startDate = this.stringToDate(start, this.getData('ltPropFormat'));
			this.reset(startDate);

			endDate = this.stringToDate(end, this.getData('ltPropFormat'));
			this.reset(endDate);

			if (current >= startDate && current <= endDate) {
				return true;
			}
		}
		else {
			endDate = this.stringToDate(end, this.getData('ltPropFormat'));
			this.reset(endDate);

			if (current <= endDate) {
				return true;
			}
		}

		return false;
	}

    checkDate(current) {
		var start = this.getData( 'ltPropMinDate' ) || '', 
		end = this.getData( 'ltPropMaxDate' ) || '';

		return this.isInRange( current, start, end );
	}

    getNumberOfFirstRowDates(firstday) {
		var startDayOfMonth = this.getData( 'ltPropStartWeekDay' ), 
		firstRowDays;

		if( firstday == 0 ) {
			firstRowDays = startDayOfMonth === 0 ? 7 : startDayOfMonth;
		}
		else {
			if (firstday < startDayOfMonth) {
				firstRowDays = startDayOfMonth - firstday;
			}
			else {
				firstRowDays = 7 - (firstday - startDayOfMonth);
			}
		}

		return firstRowDays;

	}

    getNumberToSubtract(firstday) {
		var numberToSubtract, startDayOfMonth = this.getData( 'ltPropStartWeekDay' );

		if (firstday == 0) {
			numberToSubtract = startDayOfMonth == 0 ? 0 : 7 - startDayOfMonth;
		}
		else {
			if (firstday < startDayOfMonth) {
				numberToSubtract = 7 - (startDayOfMonth - firstday);
			}
			else {
				numberToSubtract = firstday - startDayOfMonth;
			}
		}

		return numberToSubtract;
	}

    getFirstDay(cur) {
		var date = cur.getDate(), day = cur.getDay(), first;

		first = date - Math.floor(date / 7) * 7 - 1;
		first = day - first;

		if (first < 0) {
			first = 7 - first;
		}

		return first;
	}

    getRemainingDays(numberOfDaysInMonth, firstRowDays) {
		var rem = numberOfDaysInMonth - firstRowDays;
		rem = rem - 28;

		return rem;
	}

    inc(rem, num) {
		var preventAddingRows = this.getData( 'ltPropPreventAddingRows' );

		if (preventAddingRows) {
			return num;
		}

		if (rem > 0 && num == 6) {
			return 7;
		}

		return num;
	}

    getFirstDateOfDateView() {
		var cur = this.getData( 'viewDate' ), 
		firstday =  this.getFirstDay( cur ),
		month = cur.getMonth(), year = cur.getFullYear(),
		calStartDate = new Date( month + 1 + '/1/' + year ),
		numberToSubtract = this.getNumberToSubtract( firstday );

		calStartDate.setDate( calStartDate.getDate() - numberToSubtract );

		return calStartDate;
	}

    getNumberOfRowsToDisplay() {
		var numberOfRows = this.getData( 'ltPropNumberOfRows' ),
		cur = this.getData( 'viewDate' ),
		firstday = this.getFirstDay( cur ), 
		numberOfDaysInMonth = this.getNumber( cur.getMonth(), cur.getFullYear() ),
		firstRowDays = this.getNumberOfFirstRowDates( firstday ),
		rem = this.getRemainingDays( numberOfDaysInMonth, firstRowDays );

		return this.inc( rem, numberOfRows );
	}

    setDatesFunction() {
		var fillRows = this.getData( 'ltPropFillRows' ), 
		reachedNextMonth = false,
		cur = this.getData( 'viewDate' ),
		month = cur.getMonth(), 
		result = [], numberOfRows;

		var weekNumber = this.getCurrentWeekNumber( cur );
		var weekNumArr = [];

		numberOfRows = this.getNumberOfRowsToDisplay();

		var calStartDate = this.getFirstDateOfDateView();
		
		// Construct array
		for (var i = 0; i < numberOfRows; i++) {

			// This is to ensure that we don't create an empty row when we reach the next month when fillRows is false.
			if (reachedNextMonth) {
				break;
			}

			var weekStartDate = this.cloneDateObj( calStartDate );

			result.push( [] );

			for( var j = 0; j < 7; j++ ) {
				if( 
					( !fillRows && month !== calStartDate.getMonth() )
					|| ( fillRows && this.isYYFormat() && this.outsideBoundary( calStartDate ) && !this.isIso ) 
				) {
					result[ i ].push( { emptyBlock: true } );

					if (i != 0) {
						reachedNextMonth = true;
					}

				}
				else {
					result[ i ].push( this.createDateCell( calStartDate, this.getCellClass( calStartDate ) ) );
				}

				calStartDate.setDate( calStartDate.getDate() + 1 );
			}

			var nextWeekStartDate = this.cloneDateObj( calStartDate );
			weekNumArr.push( this.createWeekCell( weekStartDate, nextWeekStartDate, weekNumber ) );
			weekNumber++;
		}

		this.setData( 'matrix', result );
		this.setData( 'weeknum', weekNumArr );

		if (this.shouldActivateCell()) {
			this.activateRelevantCell();
		}
	}

    createWeekCell(weekStartDate, nextWeekStartDate, weekNumber) {
		return { class: this.getWeekClass( weekStartDate, nextWeekStartDate ), val: weekNumber }
	}

    cloneDateObj(date) {
		return new Date( date );
	}

    getWeekClass(weekStartDate, nextWeekStartDate) {
		var weekNumClass = 'lyteWeekNumberGrid',
		cur = this.getData( 'viewDate' ),
		weekEndDate = nextWeekStartDate.setDate( nextWeekStartDate.getDate() - 1 ),
		todayDate = this.__ignoremin ? cur : this.toDate();

		if( this.isInRange( todayDate, weekStartDate, weekEndDate ) ) {
			weekNumClass += ' lyteCalCurWeekNum';
		}

		return weekNumClass;
	}

    isPresentInViewingMonth(currentProcessedDate) {
		var viewingMonth = this.getData( 'viewDate' ).getMonth(),
		currentProcessedMonth = currentProcessedDate.getMonth();

		return viewingMonth === currentProcessedMonth
	}

    isRangeGiven() {
		return ( this.getData( 'ltPropMinDate' ) || "" ) !== "" || ( this.getData( 'ltPropMaxDate' ) || "" ) !== "";
	}

    getCellClass(currentProcessedDate) {
		var clsname = 'lyteCalCdate', 
		isRangeGiven = this.isRangeGiven(),
		isInRange = this.checkDate( currentProcessedDate ),
		disabledDates = this.getDisabledDates(),
		isDisabled = this.isDisabled( currentProcessedDate, disabledDates ),
		selectionType = this.getData( 'ltPropSelectionType' ) || 'day',
		curSelectedDate = this.getSelectedDateObj(),
		cur = this.getData( 'viewDate' ), 
		todayDate = this.__ignoremin ? cur : this.toDate();

		if( !this.isPresentInViewingMonth( currentProcessedDate ) ) {
			clsname += ' lyteCalDiffMonth';

			if( !isRangeGiven ) {
				clsname += ' lyteCalGray';
			}

			// Out of range in different month
			else if( !isInRange ) {
				clsname += ' lyteCalDisabled';
			}		
		}

		// Out of range in same month
		else if( isRangeGiven 
			&& !isInRange ) {
			clsname += ' lyteCalDisabled';
		}

		if( isDisabled ) {
			clsname += ' lyteCalendarDisabledDate';
		}

		// select-date might be some internal property used somewhere
		if( selectionType === 'day' && this.isSelectedDate( currentProcessedDate, curSelectedDate ) && this.getData( 'selectDate' ) ) {
			clsname += ' lyteCalSel';
		}

		if( selectionType === 'week' ) {
			clsname += ' ' + this.getWeekSelectedClass( currentProcessedDate );
		}

		if( 
			todayDate.getMonth() === currentProcessedDate.getMonth() 
			&& todayDate.getDate() === currentProcessedDate.getDate() 
			&& todayDate.getYear() === currentProcessedDate.getYear() ) {

			clsname += ' lyteCalToday';
		}
		
		clsname += this.addWeekEndClass( currentProcessedDate, isDisabled );
		clsname += this.addHolidayClass( currentProcessedDate, isDisabled );
		clsname += ' lyteCalTableCell';

		return clsname;
	}

    addWeekEndClass(currentProcessedDate, isDisabled) {
		var clsname = '';
		var holidayDates = this.getHolidayDates();

		if( this.isWeekend( currentProcessedDate ) ) {
			clsname += ' lyteCalWeekend';	//only weekend

			/* ltPropDisableWeekends property should disable all weekends whether they are present in lt-prop-disabled-dates or not*/
			if( this.getData('ltPropDisableWeekends') && !isDisabled ){
				clsname += ' lyteCalendarDisabledDate'; 
			}

			if( this.getData('ltPropHighlightWeekendHolidays') && this.isHoliday( currentProcessedDate, holidayDates ) ){
				clsname += ' lyteCalWeekendHoliday'; 	//weekend and holiday 
			}
		}

		return clsname;
	}

    addHolidayClass(currentProcessedDate, isDisabled) {
		var clsname = '';
		var holidayDates = this.getHolidayDates();

		if( this.isHoliday( currentProcessedDate, holidayDates ) ) {
			clsname += ' lyteCalHoliday';

			/* ltPropDisableHolidays property should disable all holidays whether they are present in lt-prop-disabled-dates or not*/
			if( this.getData('ltPropDisableHolidays') && !isDisabled ){
				clsname += ' lyteCalendarDisabledDate';
			}
		}

		return clsname;
	}

    createDateCell(calStartDate, clsname) {
		var obj = {},
		format = this.getData( 'ltPropFormat' );

		obj.date = calStartDate.getDate();
		obj.id = this.generateRandomId();
		obj.clsname = clsname;
		obj.val = this.getDateFromFormat( calStartDate, format );

		return obj;
	}

    isSelectedDate(date, selectedDate) {
		var isMultiple = this.getData( 'ltPropMultiple' );

		if (isMultiple) {
			return this.isDateInArray(selectedDate, date);
		}
		else {
			return selectedDate !== 'nodate' && selectedDate !== 'Invalid Date' && this.isSameDate(date, selectedDate);
		}
		
	}

    isDateInArray(dateArr, date) {
		dateArr = dateArr || [];

		for (var i = 0; i < dateArr.length; i++) {
			if (this.isSameDate(date, dateArr[i])) {
				return true;
			}
		}
	}

    isSameDate(obj1, obj2) {
		return obj1.getYear() == obj2.getYear()
			&& obj1.getMonth() == obj2.getMonth()
			&& obj1.getDate() == obj2.getDate();
	}

    getSelectedDateObj() {
		var isMultiple = this.getData( 'ltPropMultiple' ),
		selectedDates = this.getData( 'ltPropCurrentDates' ),
		that = this,
		dateObj;

		if (isMultiple) {
			return this.getDObjArrayFromStrings(selectedDates);
		}
		else {
			if (this.isIso) {
				dateObj = this.isoToDate(this.getData('ltPropIso'));
			} else {
				dateObj = this.getData('ltPropCurrentDate') ? this.stringToDate(this.getData('ltPropCurrentDate'), this.getData('ltPropFormat')) : 'nodate';
			}

			return dateObj;
		}

	}

    getDObjArrayFromStrings(dates) {
		var that = this;

		dates = dates || [];

		return dates.map( function( date ) { 
			return that.stringToDate( date, that.getData( 'ltPropFormat' ) );
		} );
	}

    getDisabledDates() {
		var disabledDates = this.getData( 'ltPropDisabledDates' );

		return this.getDObjArrayFromStrings( disabledDates );
	}

    isDisabled(date, disabledDates) {
		return this.isDateInArray( disabledDates, date );
	}

    getWeekSelectedClass(currentDate) {
		var selectedWeek = this.getData( 'ltPropCurrentWeek' ) || [],
		weekStart = selectedWeek[ 0 ] || '',
		weekEnd = selectedWeek[ 1 ] || '',
		format = this.getData( 'ltPropFormat' );

		weekStart = this.stringToDate(weekStart, format);
		weekEnd = this.stringToDate(weekEnd, format);

		if (weekStart === 'Invalid Date' || weekEnd === 'InvalidDate' || currentDate < weekStart || currentDate > weekEnd) {
			return ''
		}
		else {
			return 'lyteCalWeekSel';
		}
	}

    isWeekend(date) {
		var day = date.getDay(),
			weekends = this.getData('ltPropWeekends') || [];

		return !!~weekends.indexOf( day );
	}

    getHolidayDates() {
		var holidayDates = this.getData( 'ltPropHolidays' );

		return this.getDObjArrayFromStrings( holidayDates );
	}

    isHoliday(date, holidayDates) {
		return this.isDateInArray( holidayDates, date );
	}

    shouldActivateCell() {
		var disableNavigation = this.getData( 'ltPropDisableNavigation' ),
		/* input can set the lt-prop-current-date - so don't activate during observer changes because input might lose focus */
		isObserverCall = this.isFromCurrentDateObserver,

			/* don't focus when previous/next buttons are pressed */
			navigationButtonPressed = this.navigationButtonPressed;

		this.isFromCurrentDateObserver = false;

		this.navigationButtonPressed = false;

		return !disableNavigation && !isObserverCall && !navigationButtonPressed;
	}

    /** 
	 * get proper month from user defined value
	 * @param {String} mon - The current month
	 *
	 */

    getProperMonth(val) {
		var sm = {
			'jan': 1,
			'feb': 2,
			'mar': 3,
			'apr': 4,
			'may': 5,
			'jun': 6,
			'jul': 7,
			'aug': 8,
			'sep': 9,
			'oct': 10,
			'nov': 11,
			'dec': 12
		}, lg = {
			'january': 1,
			'february': 2,
			'march': 3,
			'april': 4,
			'may': 5,
			'june': 6,
			'july': 7,
			'august': 8,
			'september': 9,
			'october': 10,
			'november': 11,
			'december': 12
		}, ret

		val = val.toLowerCase();
		ret = sm[val] || lg[val];

		if (!ret && ret !== 0) {
			return parseFloat(val) - 1;
		}

		return ret-1;
	}

    /**
	 * Checks if the date is a proper date for the corresponding month and year
	 * @param {Number} year - The year of the date object
	 * @param {Number} month - The month of the date object
	 * @param {Number} date - The date value of the date object
	 *
	 */

    isProperDate(year, month, date) {
		var daysInMonth = this.getNumber( month, year );

		if (date <= daysInMonth) {
			return true;
		}

		return false;
	}

    /**
	 * Return the date object for the given string and format
	 * @param {String} dateString - The current date in the form of a string
	 * @param {String} format - The format of the dateString
	 *
	 */

    getDateObjFromString(dateString, format) {
		try {
			var vals = dateString.match(/([\da-z]+)/ig), year, month,
				format = format.toUpperCase(),
				sep = format.match(/([a-z]+)/ig),
				date = this.toDate(), i = 0, order = ['Y', 'M', 'D'];
			date.setDate(1);  //initialize the day to be 1 to avoid error for eg: 30 Feb if passed will generate 1 Mar as result.

			if (vals.length !== 3) {
				return 'Invalid Date';
			}

			while (i < sep.length) {
				var ind = this.getOrderIndex(sep, order[i]);

				if (i == 0) {
					date.setFullYear(year = vals[ind]);
				}
				else if (i == 1) {
					month = this.getProperMonth(vals[ind]);

					if (month < 0 || month > 11) {
						return 'Invalid Date';
					}

					date.setMonth(month);
				}
				else if (i == 2) {
					if (!this.isProperDate(year, month, vals[ind])) {
						return 'Invalid Date';
					}

					date.setDate(vals[ind]);
				}

				if (date.toString() === 'Invalid Date') {
					return date.toString();
				}

				i++;
			}

			return date;
		}
		catch (e) {
			return 'Invalid Date';
		}
	}

    getDateObjFromMoment(dateString, format) {
		var momentObj, ret;

		format = this.getRelevantFormat(format);

		if (!dateString) {
			return 'Invalid Date';
		}

		try {
			momentObj = this.moment(dateString, format);
			ret = momentObj.getDObj();
		}
		catch (e) {
			ret = 'Invalid Date';
		}

		if (Object.prototype.toString.call(ret) === '[object Date]') {
			if (isNaN(ret.getTime())) {
				ret = 'Invalid Date';
			}
		}

		return ret || 'Invalid Date';
	}

    /**
	 * Convert the string to date object based on the format
	 * @param {String} cur - The current date of the user passed
	 * @param {String} format - The format of the dates
	 *
	 */

    stringToDate(cur, format) {
		var ret;

		cur = this.convertToEnglish(cur);

		if (this.isMomentSupported) {
			ret = this.getDateObjFromMoment(cur, format);
		}
		else {
			ret = this.getDateObjFromString(cur, format);
		}

		return ret;
	}

    findISO() {
		this.isIso = this.getData('ltPropIso') ? true : false;
	}

    isoToDate(cur) {
		var ret = $L.moment(cur).getDObj();
		this.data.ltPropCurrentDate = $L.moment(ret).format(this.getData('ltPropFormat'));
		return ret;
	}

    convertToEnglish(cur) {
		var i18n = this.getData( 'ltPropI18n' ),
		format = this.getData( 'ltPropFormat' );

		if (i18n) {
			return this.moment(cur, format, { i18n: true }).format(format);
		}

		return cur;
	}

    getEnglishShorthand(cur) {
		var months = this.getShortHands(), proper = -1, max = 0,
			shortHands = this.getData('shortHands');

		for (var i = 0; i < months.length; i++) {
			if (!!~cur.indexOf(months[i]) && months[i].length > max) {
				proper = i;
				max = months[i].length;
			}
		}

		if (proper !== -1) {
			cur = cur.replace(months[proper], this.getProperShortHand(shortHands[proper]));
		}

		return cur;
	}

    getShortHands() {
		var shortHands = this.getData( 'shortHands' ), res = [];

		for( var i = 0; i < shortHands.length; i++ ) {
			res.push( window._lyteUiUtils.i18n( shortHands[ i ] ) );
		}

		return res;
	}

    getProperShortHand(val) {
		if( val === 'short.may' ) {
			return 'May';
		}

		return val;
	}

    getEnglishStandard(cur) {
		var months = this.getStandardMonths(), englishMonths = this.getData( 'monthNames' ),
		proper = -1, max = 0;

		for (var i = 0; i < months.length; i++) {
			if (!!~cur.indexOf(months[i]) && months[i].length > max) {
				proper = i;
				max = months[i].length;
			}
		}

		if (proper !== -1) {
			cur = cur.replace(months[proper], englishMonths[proper]);
		}

		return cur;
	}

    getStandardMonths() {
		var monthNames = this.getData( 'monthNames' ), res = [];

		for( var i = 0; i < monthNames.length; i++ ) {
			res.push( window._lyteUiUtils.i18n( monthNames[ i ] ) );
		}

		return res;
	}

    getOrderIndex(objArr, match) {
		for(var i = 0; i < objArr.length; i++){
			if(objArr[i].charAt(0) === match){
				return i;
			}
		}
		return -1;
	}

    buildYears() {
		/*var yearBounds = this.buildMinAndMaxYear(),*/
		var maxYear = 2100,
			minYear = 1900, i, years = [];

		for (i = minYear; i <= maxYear; i++) {
			years.push(i.toString());
		}
		// if(this.isIso){
		// 	years.push( $L.moment(this.getData('ltPropIso')).get('fullYear') )
		// }
		this.setData( 'years', years );
	}

    /*buildMinAndMaxYear: function() {
			
		var currentDate = this.toDate();
		var isYYFormat = this.isYYFormat(),
		currentYear = currentDate.getFullYear(),
		dateBounds = this.isMomentSupported ? $L.moment() : { uL: 19, lL: 80 },
		valueToAdd = dateBounds.uL,
		valueToRemove = dateBounds.lL;

		return {
			maxYear: isYYFormat ? currentYear + valueToAdd : 2100,
			minYear: isYYFormat ? currentYear - valueToRemove : 1900
		};

	},*/

    setAndBuildView(viewType, event, preventCallback) {
		var oldView = this.getData( 'viewType' ),
		newView = viewType;

		this.setData('viewType', viewType);

		if (viewType === 'monthView') {
			this.buildMonthView();
		}
		else if (viewType === 'decadeView') {
			this.buildDecadeView();
			this.setData('showToday', false);
		}
		else if (viewType === 'dateView') {
			this.buildDateView();
		}

		if( this.getData('ltPropAlwaysShowToday') ){
			this.setData( 'showToday', true );
		}
		// pressing the today button should not fire the viewChange when it is in the dateview
		if (!preventCallback && (oldView !== newView)) {
			if (this.getMethods('onViewChange')) {
				this.executeMethod('onViewChange', event, viewType, this);
			}
		}
		
	}

    buildDateView() {
		this.buildDateViewHeader();
		this.buildDateViewContent();
		this.showtoday();
	}

    buildDateViewHeader() {		
		var viewDate = this.getData( 'viewDate' );
		var year = viewDate.getFullYear();
		var month = viewDate.getMonth();
		var currentYear = viewDate.getFullYear();
		var numberOfYearsFromDecadeStart = currentYear % 10;
		var decadeStart = currentYear - numberOfYearsFromDecadeStart;
		var decadeEnd = decadeStart + 9;

		this.setData( 'monthHeader', this.getMonthHeader() );
		this.setData( 'ltPropCurrentDisplayMonth', month );
		this.setData( 'ltPropCurrentDisplayYear', year );
		this.setData('ltPropCurrentDisplayDecade',decadeStart + '-' + decadeEnd);

	}

    buildDateViewContent() {
		this.setDatesFunction();
	}

    buildMonthView() {
		this.buildMonthViewHeader();
		this.buildMonthViewContent();
		this.showtoday();
		this.activateCell( this.getActiveCell() );
	}

    buildMonthViewHeader() {
		var viewDate = this.getData( 'viewDate' );
		var year = viewDate.getFullYear();
		var currentYear = viewDate.getFullYear();
		var numberOfYearsFromDecadeStart = currentYear % 10;
		var decadeStart = currentYear - numberOfYearsFromDecadeStart;
		var decadeEnd = decadeStart + 9;

		this.setData( 'currentYear', year );
		this.setData( 'ltPropCurrentDisplayYear', year );
		this.setData('ltPropCurrentDisplayDecade',decadeStart + '-' + decadeEnd);

	}

    buildMonthViewContent() {
		var systemValues = this.getData( 'monthSystemValues' ),
		displayValue = this.getData( 'shortHands' ),
		rowCount = 3, columnCount = 4,
		rowIterator = 0, columnIterator,
		result = [], indexOfMonth;

		for (; rowIterator < rowCount; rowIterator++) {
			result.push([]);

			for (columnIterator = 0; columnIterator < columnCount; columnIterator++) {
				indexOfMonth = (rowIterator * columnCount) + columnIterator;

				result[rowIterator].push(
					{
						displayValue: window._lyteUiUtils.i18n( displayValue[ indexOfMonth ] ),
						systemValue: systemValues[ indexOfMonth ],
						class: this.getProperClassForMonthView( indexOfMonth )
					} 
				);
			}
		}

		this.setData( 'monthViewData', result );
	}

    getProperClassForMonthView(month) {
		var viewDate = this.getData( 'viewDate' ),
		viewYear = viewDate.getFullYear(),
		todayMonth = this.getCurrentMonth(),
		todayYear = this.getCurrentYear(),
		format = this.getData( 'ltPropFormat' ),
		curDate = this.stringToDate( this.getData( 'ltPropCurrentDate' ), format ),
		previousActiveDate = this.getData( 'previousActiveCellDate' ) || '',
		previousActiveMonth = this.getData( 'monthSystemValues' ).indexOf( previousActiveDate ),
		ret = 'lyteCalTableCell', curMonth, selectedMonth = this.getData( 'ltPropCurrentMonth' );

		ret += todayYear === viewYear && month === todayMonth ? ' lyteDrillCalCurrentMonth' : '';

		if (previousActiveMonth !== -1) {
			ret += month === previousActiveMonth ? ' lyteCalNavCell' : '';
		}
		else if (curDate !== 'Invalid Date') {
			curMonth = curDate.getMonth();
			ret += month === curMonth ? ' lyteCalNavCell' : '';
		}
		else {
			ret += month === todayMonth ? ' lyteCalNavCell' : '';
		}

		if (selectedMonth === (month + 1).toString()) {
			ret += ' lyteCalMonthSel';
		}


		return ret;
	}

    getCurrentYear() {
		var date = this.toDate();

		return date.getFullYear();
	}

    getCurrentMonth() {
		var date = this.toDate();

		return date.getMonth();
	}

    buildDecadeView() {
		this.buildDecadeViewHeader();
		this.buildDecadeViewContent();
		this.activateCell( this.getActiveCell() );
	}

    buildDecadeViewHeader() {
		var viewDate = this.getData( 'viewDate' ),
		currentYear = viewDate.getFullYear(),
		numberOfYearsFromDecadeStart = currentYear % 10,
		decadeStart = currentYear - numberOfYearsFromDecadeStart,
		decadeEnd = decadeStart + 9;

		this.setData( 'decadeStart', decadeStart );
		this.setData( 'decadeEnd', decadeEnd );
		this.setData('ltPropCurrentDisplayDecade',decadeStart + '-' + decadeEnd);
	}

    buildDecadeViewContent() {
		var viewDate = this.getData( 'viewDate' ),
		currentYear = viewDate.getFullYear(),
		numberOfYearsFromDecadeStart = currentYear % 10,
		decadeStart = currentYear - numberOfYearsFromDecadeStart,
		yearBounds = {minYear:1900 , maxYear:2100},	
		isYYFormat = this.isYYFormat(),
		minYear = yearBounds.minYear, maxYear = yearBounds.maxYear,	
		rows = 3, columns = 4, i, j, result = [], year;

		for( i = 0; i < rows; i++ ) {
			result.push( [] );

			for (j = 0; j < columns; j++) {

				year = (decadeStart + i * 4 + j) - 1;

				if (isYYFormat) {
					result[i].push(
						(year > maxYear || year < minYear) ? this.emptyCell() : this.currentYearCell(year, decadeStart)
					);
				}
				else {
					result[i].push(this.currentYearCell(year, decadeStart));
				}

			}
		}

		this.setActiveDecadeCell(result);

		this.setData( 'decadeViewData', result );
	}

    emptyCell() {
		return {
			emptyBlock: true
		};
	}

    currentYearCell(year, decadeStart) {
		var decadeEnd = decadeStart + 9,
			classVal = [], todayYear = this.getCurrentYear(),
			selectedYear = this.getData('ltPropCurrentYear');

		if (year < decadeStart || year > decadeEnd) {
			classVal.push('lyteCalOtherDecadeCell');
		}

		if (todayYear === year) {
			classVal.push('lyteDrillCalCurrentYear');
		}

		if (selectedYear === year.toString()) {
			classVal.push('lyteCalYearSel')
		}

		return {
			year: year,
			emptyBlock: false,
			class: classVal.join(' ')
		}
	}

    setActiveDecadeCell(result) {
		var currentDate = this.getData( 'ltPropCurrentDate' ),
		format = this.getData( 'ltPropFormat' ),
		currentDateObj = this.stringToDate( currentDate, format ),
		previousActiveDate = this.getData( 'previousActiveCellDate' ),
		todayYear = this.getCurrentYear(),
		yearToUse = !isNaN( previousActiveDate ) ? +previousActiveDate : ( currentDateObj !== 'Invalid Date' ? currentDateObj.getFullYear() : todayYear ),
		firstCell = result[ 0 ][ 0 ], firstRenderedYear = firstCell.year, lastCell = result[ result.length - 1 ][ result[ result.length - 1 ].length - 1 ], lastRenderedYear = lastCell.year, activeCellIndex;

		if (yearToUse >= firstRenderedYear && yearToUse <= lastRenderedYear) {
			result[Math.floor((yearToUse - firstRenderedYear) / 4)][(yearToUse - firstRenderedYear) % 4].class += ' lyteCalNavCell';
		}
		else {
			if (yearToUse % 10 === 9) {
				activeCellIndex = Math.abs(yearToUse - firstRenderedYear) < Math.abs(yearToUse - lastRenderedYear) ? 0 : 10;
			}
			else if (yearToUse % 10 === 0) {
				activeCellIndex = Math.abs(yearToUse - firstRenderedYear) < Math.abs(yearToUse - lastRenderedYear) ? 1 : 11;
			}
			else {
				activeCellIndex = (yearToUse % 10) + 1;
			}


			result[Math.floor(activeCellIndex / 4)][activeCellIndex % 4].class += ' lyteCalNavCell';
		}
	}

    buildNavigationalUI() {
		var type = this.getData( 'ltPropHeaderType' );

		if (this.isDropdownHeader()) {
			this.buildYears();
		}
	}

    init() {
		this.findISO();
	}

    setCalendarIdsForAria() {
		this.setData( 'headerId', this.generateRandomId() );
		this.setData( 'monthDropdownId', this.generateRandomId() );
		this.setData( 'yearDropdownId', this.generateRandomId() );
		this.setData( 'monthAriaObj', { 'aria-labelledby': this.getData( 'monthDropdownId' ) } );
		this.setData( 'yearAriaObj', { 'aria-labelledby': this.getData( 'yearDropdownId' ) } );
	}

    revertToSelected() {
		var from = new Date( this.getData( 'viewDate' ).getTime() ), 
		cur = this.getData( 'ltPropCurrentDate' ),
		format = this.getData( 'ltPropFormat' ),
		curDate = cur ? this.stringToDate( cur, format ) : this.toDate(),
		today = this.toDate(), event = {};

		if( curDate === 'Invalid Date' ) {
			return ;
		}
		
		curDate.setDate(1);

		var to = new Date(curDate.getTime());

		this.setData('viewDate', curDate);
		this.setAndBuildView('dateView', event);

		if (to.getMonth() === today.getMonth() && to.getFullYear() === today.getFullYear()) {
			this.setData('showToday', false);
		}
		else {
			this.setData('showToday', true);
		}
		
		if( this.getData('ltPropAlwaysShowToday') ){
			this.setData( 'showToday',true );
		}
		if( this.getMethods( 'onNavigate' ) 
			&& ( from.getMonth() !== to.getMonth() 
			|| from.getFullYear() !== to.getFullYear() ) 
		) {
			this.executeMethod('onNavigate', event, this.getDateFromFormat(from, this.getData('ltPropFormat')), this.getDateFromFormat(to, this.getData('ltPropFormat')), this);
		}
	}

    addContainerClass() {
		var type = this.getData( 'ltPropHeaderType' ),
		classVal = [ 'lyteCalendarPopup' ];

		if (type === 'drilldown') {
			classVal.push('lyteDrillDownCalendar');
		}

		this.setData( 'containerClass', classVal.join( ' ' ) );
	}

    checkForMoment() {
		this.isMomentSupported = $L && $L.moment ? true : false; 
		this.isHavingTimezone = this.isMomentSupported && !!$L.moment()._timezone;
	}

    buildViewDate() {
		if(this.isIso){
			var viewDate = this.isoToDate( this.getData('ltPropIso') );
		}else{
			var viewDate = this.determineViewDateFromUserInput();
		}

		if( viewDate === 'Invalid Date' ) {
			viewDate = this.toDate();
		}

		viewDate.setDate( 1 );
		this.setData( 'viewDate', viewDate );
	}

    determineViewDateFromUserInput() {
		var viewDate, selectionType = this.getData( 'ltPropSelectionType' ), currentWeek, startDay;

		if( selectionType === 'week' ) {
			currentWeek = this.getData( 'ltPropCurrentWeek' ) || [];

			startDay = currentWeek[ 0 ];

			viewDate = startDay ? 
						this.stringToDate( startDay, this.getData( 'ltPropFormat' ) ) 
						: this.toDate();
		}
		else {
			viewDate = this.getData( 'ltPropCurrentDate' ) ? 
						this.stringToDate( this.getData( 'ltPropCurrentDate' ), this.getData( 'ltPropFormat' ) ) 
						: this.toDate();
		}
		
		return viewDate;
	}

    initializeCalendar() {
		
		this.buildNavigationalUI();
		this.decideView();
			
	}

    decideView() {
		var selectionType = this.getData('ltPropSelectionType') || 'day';

		if (selectionType === 'day' || selectionType === 'week') {
			this.setAndBuildView('dateView', undefined, true);
		}
		else if (selectionType === 'month') {
			this.setAndBuildView('monthView', undefined, true);
		}
		else if( selectionType === 'year' ){
			this.setAndBuildView( 'decadeView', undefined, true );
		}
		else{
			this.setAndBuildView( 'dateView', undefined, true );
		}
	}

    isDrilldown() {
		var type = this.getData( 'ltPropHeaderType' );

		return type === 'drilldown';
	}

    didConnect() {

		if (!this.getData('navYield') && this.isDropdownHeader()) {
			this.setData('monthDD', this.getMonthDropdown());
			this.setData('yearDD', this.getYearDropdown());
			this.setData('callFrmDidcnct', true);
		}

		if( this.getMethods('onDateHover') || this.getMethods('onMonthHover') || this.getMethods('onYearHover') ){
			this.addListenerForHoverEvent();
		}
	}

    addListenerForHoverEvent() {
		var parDiv = $L('div.lyteCalTableRowGroup')[0];
		parDiv.addEventListener('mouseover', function( event ){
			var viewType = this.getData('viewType');
			if( event.target.classList.contains('lyteCalTableCell') ){
				var target = event.target;
				if( this.getMethods('onDateHover') && viewType === 'dateView' ){
					this.executeMethod('onDateHover', event, target.getAttribute('data-date'), this);
				}
				else if( this.getMethods('onMonthHover') && viewType === 'monthView' ){
					var currentSelectedMonth = this.getData('monthSystemValues').indexOf(target.getAttribute('data-date')) + 1;
					this.executeMethod('onMonthHover', event, currentSelectedMonth, this);
				}
				else if( this.getMethods('onYearHover') && viewType === 'decadeView' ){
					this.executeMethod('onYearHover', event, target.getAttribute('data-date'), this);
				}
			}
		}.bind(this));
	}

    isDropdownHeader() {
		var type = this.getData( 'ltPropHeaderType' );

		return type === 'picklist' || type === 'dropdown';
	}

    getYearDropdown() {
		var type = this.getData( 'ltPropHeaderType' ), 
		ret = this.$node.querySelector( '.lyteCalYearDD' );

		if (type === 'picklist') {
			ret = ret.querySelector('lyte-dropdown');
		}

		return ret;
	}

    getMonthDropdown() {
		return this.$node.querySelector( '.lyteCalMonthDD' );
	}

    isWithinAllowedYears(date) {
		var year = date.getFullYear();

		if (year >= 1900 && year <= 2100) {
			return true;
		}

		return false;
	}

    changeCurrentDate(set, val, event) {
		var inter, to, from = new Date( this.getData( 'viewDate' ).getTime() ), 
		fromDate, toDate, formattedDate, format = this.getData( 'ltPropFormat' ),
		isYYFormat = this.isYYFormat();

		if (set === 'Y') {
			inter = this.getData('viewDate');
			if (this.isIso) {
				formattedDate = $L.moment(this.getData('viewDate'));
				isYYFormat = false;
			} else {
				formattedDate = this.moment(this.getDateFromFormat(inter, format), format);
			}

			if (this.isMomentSupported) {
				if (val > 0) {
					to = this.moment(formattedDate, format).add(val, 'fullYear', isYYFormat).getDObj();
				}
				else {
					to = this.moment(formattedDate, format).add(val, 'fullYear', isYYFormat).getDObj();
				}
			}
			else {
				inter.setYear(inter.getFullYear() + val)
				to = new Date(inter.getTime())
			}

			this.setData('viewDate', to);
			this.buildDateView();
		}
		else if (set === 'M') {
			inter = this.getData('viewDate');
			if (this.isIso) {
				formattedDate = $L.moment(this.getData('viewDate'));
				isYYFormat = false;
			} else {
				formattedDate = this.moment(this.getDateFromFormat(inter, format), format);
			}
			if (this.isMomentSupported) {
				if (val > 0) {
					to = formattedDate.add(val, 'month', isYYFormat).getDObj();
				}
				else {
					to = formattedDate.add(val, 'month', isYYFormat).getDObj();
				}
			}
			else {
				inter.setMonth(inter.getMonth() + val)
				to = new Date(inter.getTime())
			}

			this.setData('viewDate', to)
			this.buildDateView();
		}

		fromDate = this.getDateFromFormat(from, this.getData('ltPropFormat'));
		toDate = this.getDateFromFormat(to, this.getData('ltPropFormat'));

		if (this.getMethods('onNavigate')) {
			this.executeMethod('onNavigate', event, fromDate, toDate, this)
		}
	}

    changeCurrentYear(val, event) {
		var viewDate = this.getData( 'viewDate' ),
		isMomentSupported = this.isMomentSupported,
		fullYear = viewDate.getFullYear(),
		format = this.getData( 'ltPropFormat' ),
		isYYFormat = this.isYYFormat(),
		formattedDate = this.getDateFromFormat( viewDate, format ),
		fromDate = formattedDate,
		toDate;
		if( isMomentSupported ) {
			format = this.getRelevantFormat( format );
			if(this.isIso){
				formattedDate = this.moment(this.getData('viewDate'));
				isYYFormat = false;
			} else {
				formattedDate = this.moment(formattedDate, format);
			}
			viewDate = formattedDate.add(val, 'fullYear', isYYFormat).getDObj();
		}
		else {
			viewDate.setFullYear(fullYear + val);
		}

		toDate = this.getDateFromFormat(viewDate, format);

		this.setData('viewDate', viewDate);

		if (this.getMethods('onNavigate')) {
			this.executeMethod('onNavigate', event, fromDate, toDate, this);
		}
	}

    changeCurrentDecade(val, event) {
		var viewDate = this.getData( 'viewDate' ),
		format = this.getData( 'ltPropFormat' ),
		isMomentSupported = this.isMomentSupported,
		formattedDate = this.getDateFromFormat( viewDate, format ),
		isYYFormat = this.isYYFormat(),
		currentYear = viewDate.getFullYear(),
		fromDate = formattedDate,
		toDate;

		format = this.getRelevantFormat(format);

		if (isMomentSupported) {
			if (this.isIso) {
				formattedDate = this.moment(this.getData('viewDate'));
				isYYFormat = false;
			} else {
				formattedDate = this.moment(formattedDate, format);
			}
			// viewDate = formattedDate.add( val, 'fullYear', isYYFormat ).getDObj();
			viewDate = formattedDate.add(val * 10, 'fullYear', isYYFormat).getDObj();
		}
		else {
			viewDate.setFullYear(currentYear + 10 * val);
		}

		toDate = this.getDateFromFormat(viewDate, format);
		this.setData('viewDate', viewDate);

		if (this.getMethods('onNavigate')) {
			this.executeMethod('onNavigate', event, fromDate, toDate, this);
		}
	}

    /** 
	 * Get the proper calendar date item that was clicked
	 * @param {Element} elem - represents the element that was clickedd
	 *
	 */
    getProper(elem) {
		while( elem 
			&& !elem.classList.contains( 'lyteCalTableCell' ) 
		) {
			elem = elem.parentElement;
		}

		return elem;
	}

    convertToLang(val) {
		var i18n = this.getData( 'ltPropI18n' ),
		format = this.getData( 'ltPropFormat' );

		if (i18n) {
			return this.moment(val, format).i18N(format);
		}

		return val;
	}

    moveToPrevious(val, event) {
		var viewType = this.getData( 'viewType' );

		if (viewType === 'dateView') {
			this.navigationButtonPressed = true;
			this.changeCurrentDate(val, -1, event);
		}
		else if (viewType === 'monthView') {
			this.changeCurrentYear(-1, event);
			this.buildMonthView();
		}
		else if (viewType === 'decadeView') {
			this.changeCurrentDecade(-1, event);
			this.buildDecadeView();
		}
	}

    moveToNext(val, event) {

		var viewType = this.getData('viewType');

		if (viewType === 'dateView') {
			this.navigationButtonPressed = true;
			this.changeCurrentDate(val, 1, event);
		}
		else if (viewType === 'monthView') {
			this.changeCurrentYear(1, event);
			this.buildMonthView();
		}
		else if (viewType === 'decadeView') {
			this.changeCurrentDecade(1, event);
			this.buildDecadeView();
		}
	}

    changeToMonthView(event) {
		this.setAndBuildView( 'monthView', event );
	}

    changeToDecadeView(event) {
		this.setAndBuildView( 'decadeView', event );
	}

    selectHighlightedCell(event) {
		var viewType = this.getData( 'viewType' ),
		headerType = this.getData( 'ltPropHeaderType' );

		if (headerType !== 'drilldown' || viewType === 'dateView') {
			this.makeSelection(event);
		}
		else if (viewType === 'monthView') {
			this.monthSelected(event);
		}
		else {
			this.yearSelected(event);
		}
	}

    selectDate(event) {
		var isMultiple = this.getData( 'ltPropMultiple' );

		if (isMultiple) {
			this.selectMultiple(event);
		}
		else {
			this.selectSingle(event);
		}
	}

    selectMultiple(event) {
		var dateCell = this.getProper( event.target );

		if (this.terminateSelection(this.fireBeforeCallback(event, dateCell))) {
			return;
		}

		if (this.alreadySelected(dateCell)) {
			this.removeSelectedCell(dateCell);
			this.removeSelected(dateCell);

			if (this.getMethods('onDateRemoved')) {
				this.executeMethod('onDateRemoved', event, dateCell.getAttribute('data-date'), this);
			}
		}
		else {
			this.selectCell(event);
		}
	}

    terminateSelection(beforeCallbackReturnValue) {
		return beforeCallbackReturnValue === false;
	}

    fireBeforeCallback(event, dateCell) {
		if( this.alreadySelected( dateCell ) ) {
			return this.fireBeforeRemove( event, dateCell );
		}

		return this.fireBeforeAdd( event, dateCell );
	}

    fireBeforeRemove(event, dateCell) {
		if( this.getMethods( 'onBeforeRemove' ) ) {
			return this.executeMethod( 'onBeforeRemove', event, dateCell.getAttribute( 'data-date' ), this );
		}
	}

    fireBeforeAdd(event, dateCell) {
		if( this.getMethods( 'onBeforeAdd' ) ) {
			return this.executeMethod( 'onBeforeAdd', event, dateCell.getAttribute( 'data-date' ), this );
		}
	}

    alreadySelected(cell) {
		return cell.classList.contains( 'lyteCalSel' );
	}

    removeSelected(cell) {
		var dateToRemove = cell.getAttribute( 'data-date' ),
		selectedDates = this.getData( 'ltPropCurrentDates' ) || [],
		indexToRemove = selectedDates.indexOf( dateToRemove );

		if( !!~indexToRemove ) {
			this.$addon.arrayUtils( selectedDates, 'removeAt', indexToRemove );
		}
	}

    selectSingle(event) {
		this.removeDayHighlights();
		this.selectCell( event );
	}

    selectCell(event) {
		var target = this.getProper( event.target );
		
		this.setSelected( target );

		target.classList.add('lyteCalSel');
		target.setAttribute('aria-selected', 'true');
		target.setAttribute('tabindex', '1');

		if (this.getMethods('onDateSelected')) {
			this.executeMethod('onDateSelected', event, target.getAttribute('data-date'), this);
		}
	}

    setSelected(cell) {
		var isMultiple = this.getData( 'ltPropMultiple' ),
		curDate = this.convertToLang( cell.getAttribute( 'data-date' ) );

		this.setData('preventObs', true);

		if( isMultiple ) {
			this.$addon.arrayUtils( this.getData( 'ltPropCurrentDates' ), 'push', curDate );
		}
		else {
			this.setData('ltPropCurrentDate', curDate);
		}
		
		this.setData( 'preventObs', false );
	}

    monthSelected(event) {
		var viewDate = this.getData('viewDate'),
			currentYear = viewDate.getFullYear(),
			target = this.getProper(event.target),
			currentSelectedMonth = target.getAttribute('data-date'),
			isDrilldown = this.getData('ltPropHeaderType') === 'drilldown';

		currentSelectedMonth = this.getData('monthSystemValues').indexOf(currentSelectedMonth) + 1;

		this.setData('viewDate', new Date(currentSelectedMonth + '/1/' + currentYear));

		if (isDrilldown) {
			this.setAndBuildView('dateView', event);
		}

		this.removeMonthHighlight();
		this.addMonthHighlight(target);

		this.setData('ltPropCurrentMonth', currentSelectedMonth);

		if (this.getMethods('onMonthSelected')) {
			this.executeMethod('onMonthSelected', event, (currentSelectedMonth || "").toString(), this);
		}

		this.focusActiveCell();
	}

    removeMonthHighlight() {
		var month = this.$node.querySelector( '.lyteCalMonthSel' );

		if (month) {
			month.classList.remove('lyteCalMonthSel');
			month.removeAttribute('aria-selected');
		}
	}

    addMonthHighlight(cell) {
		cell.classList.add( 'lyteCalMonthSel' );
		cell.setAttribute( 'aria-selected', 'true' );
	}

    yearSelected(event) {
		var viewDate = this.getData( 'viewDate' ),
		target = this.getProper( event.target ),
		currentSelectedYear = target.getAttribute( 'data-date' ),
		isDrilldown = this.getData( 'ltPropHeaderType' ) === 'drilldown';

		viewDate.setYear(currentSelectedYear);
		this.setData('viewDate', viewDate);

		if (isDrilldown) {
			this.setAndBuildView('monthView', event);
		}

		this.removeYearHighlight();
		this.addYearHighlight(target);

		this.setData('ltPropCurrentYear', currentSelectedYear);

		if (this.getMethods('onYearSelected')) {
			this.executeMethod('onYearSelected', event, currentSelectedYear, this);
		}

		this.focusActiveCell();
	}

    removeYearHighlight() {
		var year = this.$node.querySelector( '.lyteCalYearSel' );

		if (year) {
			year.classList.remove('lyteCalYearSel');
			year.removeAttribute('aria-selected');
		}
	}

    addYearHighlight(cell) {
		cell.classList.add( 'lyteCalYearSel' );
		cell.setAttribute( 'aria-selected', 'true' );
	}

    focusDrillDownButton() {
		var button = this.$node.querySelector( '.lyteDrillCalHeaderButton' );

		if (button) {
			button.focus();
		}
	}

    makeSelection(event) {
		var selectionType = this.getData( 'ltPropSelectionType' );

		if (selectionType === 'day') {
			this.selectDate(event);
		}
		else {
			this.selectWeek(event);
		}
	}

    selectWeek(event) {
		if( !event ){
			var dateCell = this.$node.querySelector('.lyteCalToday');
		}
		else {
			var dateCell = this.getProper( event.target );
		}

		var firstDayOfWeek = this.getFirstSelectableDay( dateCell ).getAttribute( 'data-date' ),
		lastDayOfWeek = this.getLastSelectableDay( dateCell ).getAttribute( 'data-date' );

		this.removeDayHighlights();
		this.addWeekHighlight(dateCell);
		this.setData('ltPropCurrentWeek', [this.convertToLang(firstDayOfWeek), this.convertToLang(lastDayOfWeek)]);

		if (this.getMethods('onWeekSelected')) {
			this.executeMethod('onWeekSelected', event, firstDayOfWeek, lastDayOfWeek, this);
		}
	}

    removeDayHighlights() {
		this.removeSelectedCell();
		this.removeWeekHighlight();
	}

    removeSelectedCell(cell) {
		var node = cell || this.getSelectedCell();

		if (node) {
			node.classList.remove('lyteCalSel');
			node.removeAttribute('aria-selected');
			node.setAttribute('tabindex', '-1');
		}
	}

    getSelectedCell() {
		return this.$node.querySelector( '.lyteCalSel' );
	}

    removeWeekHighlight() {
		var highlightedDays = this.$node.querySelectorAll( '.lyteCalWeekSel' );
		var highlightedWeekNum = this.$node.querySelectorAll('.lyteCalWeekNumberSel');

		for( var i = 0; i < highlightedDays.length; i++ ) {
			highlightedDays[ i ].classList.remove( 'lyteCalWeekSel' );
			highlightedDays[ i ].removeAttribute( 'aria-selected' );
		} 

		for( var i = 0; i < highlightedWeekNum.length; i++ ) {
			highlightedWeekNum[ i ].classList.remove( 'lyteCalWeekNumberSel' );
			highlightedWeekNum[ i ].removeAttribute( 'aria-selected' );
		} 
		
	}

    addWeekHighlight(dateCell) {
		var firstSelectableDayOfWeek = this.getFirstSelectableDay( dateCell );

		var day = firstSelectableDayOfWeek;

		if( this.getData('ltPropWeekNumber') ){
			var parent = dateCell.parentElement;
			var target = parent.querySelector('.lyteWeekNumberGrid');

			if( target ){
				target.classList.add('lyteCalWeekNumberSel');
				target.setAttribute( 'aria-selected', 'true' );
			}
		}

		do {
			day.classList.add( 'lyteCalWeekSel' );
			day.setAttribute( 'aria-selected', 'true' );

			day = day.nextElementSibling;
		}while( day && day.getAttribute( 'data-selectable' ) === 'true' );
	}

    getFirstSelectableDay(cell) {
		var rowCells = cell.parentElement.children;

		for( var i = 0; i < rowCells.length; i++ ) {
			if( rowCells[ i ].getAttribute( 'data-selectable' ) === "true" ) {
				return rowCells[ i ];
			}
		}
	}

    getLastSelectableDay(cell) {
		var rowCells = cell.parentElement.children;

		for( var i = rowCells.length - 1; i > -1; i-- ) {
			if( rowCells[ i ].getAttribute( 'data-selectable' ) === "true" ) {
				return rowCells[ i ];
			}
		}
	}

    getCurrentWeekNumber(currentDateObj) {
		var curDateObj = new Date( currentDateObj );	//clone
		var weekNumCriteria = this.getData('ltPropWeekNumCriteria');
		var startDate = 1;
		var startWeekDay = this.getData('ltPropStartWeekDay');
		var weekNum = 0;

		switch( weekNumCriteria ){
			case 1:
				startDate = 1;
				break;

			case 2:
				//find first thursday date( can provide option for user to select 'any' day instead of thursday )
				startDate = this.getDateOfFirstDay( currentDateObj.getFullYear(), 4 ); // 4 -> thursday
				break;

			case 3: 
				//find first full week's first date
				startDate = this.getDateOfFirstDay( currentDateObj.getFullYear(), this.getData('ltPropStartWeekDay') ); 
				break;

		}

		var startDateObj = new Date( currentDateObj.getFullYear(), 0, startDate );

		this.getDateObjToStartDay( curDateObj );
		this.getDateObjToStartDay( startDateObj );

		var itrDateObj = new Date( startDateObj );

		while (itrDateObj <= curDateObj) {
			if (itrDateObj.getDay() === startWeekDay) { 
				weekNum += 1;
			}
			itrDateObj.setDate(itrDateObj.getDate() + 1); 
		}

		return weekNum;
	}

    getDateOfFirstDay(year, day) {
		var currDateObj = new Date( year, 0, 1 );
		for( var i=0; i<7; i++ ){
			if( currDateObj.getDay() === day ){
				break;
			}  
			currDateObj.setDate( currDateObj.getDate()+1 );
		}

		return currDateObj.getDate();
	}

    getDateObjToStartDay(curDateObj) {
		var startOfWeekDay = this.getData('ltPropStartWeekDay');
		for( var it=0;it<7;it++ ){
			if( curDateObj.getDay() == startOfWeekDay ){
				return;
			}
			curDateObj.setDate( curDateObj.getDate() - 1 );
		}
	}

    static actions(arg1) {
        return Object.assign(super.actions({
            changeToMonthView: function( event ) {
                this.changeToMonthView( event );
                this.focusDrillDownButton();	
            },

            changeToMonthViewOnKeys: function( event ) {
                var keyCode = event.keyCode,
                SPACE_KEY = 32,
                ENTER_KEY = 13;

                if( keyCode === ENTER_KEY || keyCode === SPACE_KEY ) {
                    this.changeToMonthView( event );
                    this.focusDrillDownButton();	
                }
            },

            changeToDecadeView: function( event ) {
                this.changeToDecadeView( event );
                this.focusActiveCell();
            },

            changeToDecadeViewOnKeys: function( event ) {
                var keyCode = event.keyCode,
                SPACE_KEY = 32,
                ENTER_KEY = 13;

                if( keyCode === ENTER_KEY || keyCode === SPACE_KEY ) {
                    this.changeToDecadeView( event );
                    this.focusActiveCell();
                }
            },

            // Detecting a one finger swipe
            record: function( event ) {
                // This is stupid
                this.setData( 'prev', false );

                if( event.touches.length > 1 ) {
                    this.setData( 'prev', true );

                    return ;
                }

                var touch = event.targetTouches[ 0 ],
                cords = {
                    x: touch.clientX,
                    y: touch.clientY
                },
                start = this.toDate().getTime();

                this.setData( 'cords', cords );
                this.setData( 'start', start );
            },

            decide: function( event ) {
                var prev = this.getData( 'prev' );

                // prev will be false only when you do a single finger swipe
                // Multi finger swipes return out of execution
                if( prev ) {
                    return ;
                }

                var start = this.getData( 'cords' ),
                x = start.x, y = start.y,
                touch = event.changedTouches[ 0 ],
                diffX = x - touch.clientX,
                diffY = y - touch.clientY,
                parent = this.$node.querySelector( '.lyteCalendarPopup' ),
                rect = parent.getBoundingClientRect(),
                width = rect.width,
                height = rect.height,
                xTolerance = width * 0.2,
                yTolerance = height * 0.15,
                begin = this.getData( 'start' ),
                delay = ( this.toDate().getTime() ) - begin;

                if( yTolerance > Math.abs( diffY ) 
                    && xTolerance < Math.abs( diffX ) 
                    && delay < 1000 
                ) {
                    if( diffX < 0 ) {
                        this.changeCurrentDate( "M", -1, event );
                    }
                    else if( diffX > 0 ) {
                        this.changeCurrentDate( "M", 1, event );
                    }
                }
                
            },

            previousOnKeys: function( val, event ) {
                var ENTER_KEY = 13, SPACE_KEY = 32, keyCode = event.keyCode;

                if( event.keyCode === ENTER_KEY || event.keyCode === SPACE_KEY ) {
                    this.moveToPrevious( val, event );
                }

            },

            nextOnKeys: function( val, event ) {
                var ENTER_KEY = 13, SPACE_KEY = 32, keyCode = event.keyCode;

                if( keyCode === ENTER_KEY || keyCode === SPACE_KEY ) {
                    this.moveToNext( val, event );
                }
            },

            previous: function( val, event ) {
                this.moveToPrevious( val, event );
            },

            next: function( val, event ) {
                this.moveToNext( val, event );
            },

            yearSelected: function( event ) {
                this.yearSelected( event );
            },

            monthSelected: function( event ) {
                this.monthSelected( event );
            },

            dateSelected: function( event ) {
                if( event.button !== 0 ) {
                    return ;
                }

                this.makeSelection( event );
            },

            performNavigation: function( event ) {
                var keyCode = event.keyCode,
                ARROW_UP = 38,
                ARROW_DOWN = 40,
                ARROW_LEFT = 37,
                ARROW_RIGHT = 39,
                SPACE_KEY = 32, 
                ENTER_KEY = 13,
                HOME_KEY = 36,
                END_KEY = 35,
                PAGE_UP = 33,
                PAGE_DOWN = 34,
                MONTH = 'M',
                navDirection, cellsToMove, cell = event.target, actionType;

                if( this.getData( 'ltPropDisableNavigation' ) ) {
                    return ;
                }

                switch( keyCode ) {
                    case ARROW_UP:
                        navDirection = 'previous';
                        actionType = 'up';
                        cellsToMove = this.getCellsToMove( navDirection, actionType );
                        this.moveBackward( event, navDirection, cellsToMove );
                        event.preventDefault();
                        break;

                    case ARROW_DOWN:
                        navDirection = 'next';
                        actionType = 'down';
                        cellsToMove = this.getCellsToMove( navDirection, actionType );
                        this.moveForward( event, navDirection, cellsToMove );
                        event.preventDefault();
                        break;

                    case ARROW_LEFT:
                        navDirection = 'previous';
                        cellsToMove = -1;
                        this.moveBackward( event, navDirection, cellsToMove );
                        event.preventDefault();
                        break;

                    case ARROW_RIGHT:
                        navDirection = 'next';
                        cellsToMove = 1;
                        this.moveForward( event, navDirection, cellsToMove );
                        event.preventDefault();
                        break;
                    case SPACE_KEY:
                    case ENTER_KEY:
                        if( this.isDisabledCell( cell ) ) {
                            return ;
                        }

                        this.selectHighlightedCell( event );
                        event.preventDefault();
                        break;
                    case HOME_KEY:
                        navDirection = 'previous';
                        this.moveToFirstCell( event, navDirection );
                        event.preventDefault();
                        break;
                    case END_KEY:
                        navDirection = 'next';
                        this.moveToLastCell( event, navDirection );
                        event.preventDefault();
                        break;
                    case PAGE_UP:
                        this.previousNavigation( MONTH, event );
                        event.preventDefault();
                        break;
                    case PAGE_DOWN:
                        this.nextNavigation( MONTH, event );
                        event.preventDefault();
                        break;
                }
            },

            today: function( event ) {
                this.revert( event );
                this.focusActiveCell();
            },

            todayOnKey: function( event ) {
                var keyCode = event.keyCode,
                SPACE_KEY = 32,
                ENTER_KEY = 13;

                if( keyCode === ENTER_KEY || keyCode === SPACE_KEY ) {
                    this.revert( event );
                    this.focusActiveCell();
                }
            },

            curWeek: function( event ) {
                //should entire row be focused? its been selected for now
                
                this.revert( event );
                this.selectWeek();
                // this.focusActiveRow();
            },

            curWeekOnKey: function( event ) {
                var keyCodes = event.keyCode;

                if( keyCodes === 13 || keyCodes === 32 ) {
                    this.revert( event );
                    this.selectWeek();
                    // this.focusActiveRow();

                }
            },

            curMonth: function( event ) {
                this.revertToMonth( event );
                // this.focusActiveCell();
            },

            curMonthOnKey: function( event ) {
                var keycode = event.keyCode;

                if( keycode === 13 || keycode === 32 ) {
                    this.revertToMonth( event );
                    // this.focusActiveCell();
                }
            },

            curYear: function( event ) {
                this.revertToYear( event );
                // this.focusActiveCell();
            },

            curYearOnKey: function( event ) {
                var keycode = event.keyCode;

                if( keycode === 13 || keycode === 32 ) {
                    this.revertToYear( event );
                    // this.focusActiveCell();
                }
            }
        }), arg1);
    }

    static methods(arg1) {
        return Object.assign(super.methods({
            optionSelected : function(prop,event,selected,comp){
                this.navigationButtonPressed = true;

                if(prop == 'M') {
                    // var index = comp.getData('ltPropOptions').indexOf(selected);
                    var index = this.getData('monthNames').indexOf(selected);

                    this.changeCurrentDate(prop, index - this.getData('viewDate').getMonth(),event);
                }
                else if(prop == 'Y') {
                    this.changeCurrentDate(prop, parseInt(selected) - this.getData('viewDate').getFullYear(),event);
                }
            },

            setClass: function( ev, comp ) {
                var drop = comp.childComp,
                rtl = window._lyteUiUtils.getRTL(),
                dir = rtl ? 'right' : 'left',
                arrow = drop.querySelector( '.lyteArrow' );

                drop.classList.add( 'lyteCalendarDropdown' )
                arrow.style[ dir ] = '20%';

                if( rtl ) {
                    arrow.style.left = 'auto';
                }
            }
        }), arg1);
    }

    static observers(arg1) {
        return Object.assign(super.observers({
            changeBodyContainerClass: function() {
                var container = this.$node.querySelector( '.lyteCalTableContainer' ),
                viewType = this.getData( 'viewType' ),
                selectionType = this.getData( 'ltPropSelectionType' );
				var isDrilldown = this.isDrilldown();

                if( isDrilldown ) {
                    if( viewType === 'dateView' ) {
                        container.classList.remove( 'lyteDrillCalMonthView' );
                        container.classList.remove( 'lyteDrillCalYearView' );
                    }
                    else if( viewType === 'monthView' ) {
                        container.classList.add( 'lyteDrillCalMonthView' );
                        container.classList.remove( 'lyteDrillCalYearView' );
                    }
                    else if( viewType === 'decadeView' ) {
                        container.classList.remove( 'lyteDrillCalMonthView' );
                        container.classList.add( 'lyteDrillCalYearView' );
                    }
                }

				this.removeSelectionStyles();
				if( !isDrilldown ){
					if( selectionType === 'day' ) {
						container.classList.add( 'lyteCalDaySelType' );
					}
					else if( selectionType === 'week' ) {
						container.classList.add( 'lyteCalWeekSelType' );
					}
					else if( selectionType === 'month' ) {
						container.classList.add( 'lyteCalMonthSelType' );
					}
					else if( selectionType === 'year' ){
						container.classList.add( 'lyteCalYearSelType' );
					}
					else {
						this.setData('ltPropSelectionType','day');
						container.classList.add( 'lyteCalDaySelType' );
					}
				}
				else if( viewType === 'dateView' ){
					if( selectionType === 'day' ) {
						container.classList.add( 'lyteCalDaySelType' );
					}
					else if( selectionType === 'week' ) {
						container.classList.add( 'lyteCalWeekSelType' );
					}
					else{
						this.setData('ltPropSelectionType','day');
						container.classList.add( 'lyteCalDaySelType' );
					}
				}

				this.setShowYearAccToView();
                
            }.observes( 'viewType', 'ltPropSelectionType' ).on( 'didConnect' ),


			yearObserver: function() {
				this.setShowYearAccToView();
			}.observes( 'ltPropYear' ),

            activateNavigation: function() {
                if( !this.getData( 'ltPropActivateNavigation' ) ) {
                    return ;
                }

                this.activateRelevantCell();

                this.setData( 'ltPropActivateNavigation', false );

            }.observes( 'ltPropActivateNavigation' ),

            setMonthAndYearDropdown : function(){
                if(!this.getData('navYield') && this.isDropdownHeader() && this.getData('monthDD') && this.getData('yearDD')){
                    var monthHeaders = this.getData('monthHeader').split( ' ' ),
                    format = this.getData( 'ltPropMonthHeaderFormat' ), 
                    lmd = /MMMM YYYY/ig,
                    ld = /MMM YYYY/ig,
                    monthArray = [],
                    monthNames, value;

                    if(arguments[0].item == "callFrmDidcnct"){
                        if(lmd.test( format )){
                            monthNames = this.getData('monthNames');
                        }
                        else if(ld.test(format)){
                            monthNames = this.getData('shortHands');
                        }
                        for(var i=0;i<monthNames.length; i++){
                            monthArray[i] = window._lyteUiUtils.i18n(monthNames[i]);
                        }
                        this.setData('monthNames',monthArray);
                    }

                    value = parseInt( monthHeaders[ 1 ] );

                    this.removeOutOfRangeOption();
                    
                    if( this.outOfRange( value ) ) {
                        this.addOutOfRangeOption( value );
                    }
                    // this.getData('monthDD').component.setData('ltPropOptions',monthArray);
                    this.getData('monthDD').component.setData('ltPropSelected',monthHeaders[0]);
                    this.getData('yearDD').component.setData('ltPropSelected',monthHeaders[1]);
                }
            }.observes('monthHeader','callFrmDidcnct'),

            startWeekDayObserver: function() {
                this.changeDaysOfWeek();
            }.observes( 'ltPropStartWeekDay' ),

            monthHeaderObserver: function() {
                this.buildDateViewHeader();
            }.observes( 'monthNames.[]' ),

            numberOfRowsChange: function() {
                // https://stackoverflow.com/questions/19727905/in-javascript-is-it-expensive-to-use-try-catch-blocks-even-if-an-exception-is-n
                // No penalty in chrome >= 60
                var numberOfRows = this.getData( 'ltPropNumberOfRows' );

                try {
                    if( numberOfRows < 5 ) {
                        throw "Calendar failed to render. The number of rows should be greater than 4.";
                    }
                }
                catch( e ) {
                    console.error( e );
                    return ;
                }

                this.setDatesFunction();
            }.observes( 'ltPropNumberOfRows' ),

            setDates: function( arg ) {
                if( this.__ignoremin && arg.item == "ltPropMinDate" ){
                    return;
                }
                this.setDatesFunction();
            }.observes( 
                'ltPropStartDate', 
                'ltPropEndDate', 
                'changeData', 
                'ltPropMinDate', 
                'ltPropMaxDate',
                'ltPropFormat',
                'ltPropStartWeekDay'
            ),

            executeViewDateChanges : function() {
                if( this.getMethods( 'onViewdateChange' ) ) {
                    this.executeMethod( 'onViewdateChange', this, this.getData( 'viewDate' ) );
                }
            }.observes( 'viewDate' ),

            initFn: function() {
                var self = this;
                
                this.addContainerClass();
                this.checkForMoment();		
                this.buildViewDate();
                this.changeDaysOfWeek();
                this.initializeCalendar();
                this.setCalendarIdsForAria();

                // set revert
                this.$node.revertToToday = function() {
                    self.revert();
                };

                this.$node.focusCalendar = function() {
                    self.setData( 'ltPropActivateNavigation', true );
                }

                this.$node.revertToSelected = function() {
                    self.revertToSelected();
                }

                // This is being internally used by CRM for their calendar
                this.$node.getDateArray = function( viewDate ) {
                    self.setData( 'viewDate', viewDate );
                    self.buildDateViewContent();

                    return self.getData( 'matrix' );
                }

            }.observes( 'currentDatechanged' ).on( 'init' ),

            selectionTypeObserver: function() {
                if( !this.isDrilldown() ) {
                    this.data.ltPropCurrentDate = '';
                    this.data.ltPropCurrentWeek = [];
                    this.data.ltPropCurrentMonth = '';
                    this.data.ltPropCurrentYear = '';
                }

                this.decideView();
            }.observes( 'ltPropSelectionType' ),

            changeIso : function(){
                
                this.isIso = true;
                var newDate = $L.moment(this.getData('ltPropIso')).getDObj();
                this.setData( 'viewDate', newDate );
                if( this.isDropdownHeader() ) {
                    this.buildYears();	
                }
                this.data.ltPropCurrentDate = $L.moment(this.getData('ltPropIso')).format(this.getData('ltPropFormat'),this.isYYFormat());
                this.buildDateView();
            }.observes('ltPropIso'),

            changeViewDate: function( val ) {
                this.isIso = false;
                var cur = this.getData( 'ltPropCurrentDate' );

                if( this.getData( 'preventObs' ) ) {
                    return ;
                }

                // Current Date is set to empty
                if( !cur ) {
                    this.removeSelectedCell();
                    return ;
                }

                // Bad current date
                if( this.stringToDate( cur, this.getData( 'ltPropFormat' ) ) === 'Invalid Date' ) {
                    this.removeSelectedCell();
                    return ;
                }

                var val = this.getData( 'ltPropCurrentDate' );
                var newDate = this.stringToDate( val, this.getData( 'ltPropFormat' ) );
                newDate.setDate( 1 );

                // if( type === 'dropdown' && !this.isWithinAllowedYears( newDate ) ) {
                // 	return ;
                // }

                this.setData( 'viewDate', newDate );
                if(this.isMomentSupported){
                    this.data.ltPropIso = this.moment(newDate).format();
                }
                this.isFromCurrentDateObserver = true;
                this.buildDateView();
            }.observes( 'ltPropCurrentDate' ),

            selectedDatesChanged: function() {
                if( this.getData( 'preventObs' ) ) {
                    return ;
                }

                // Handling invalid dates is a bit expensive

                this.isFromCurrentDateObserver = true;
                this.buildDateView();

            }.observes( 'ltPropCurrentDates.[]' ),

            disabledDatesChanged: function() {
                this.isFromCurrentDateObserver = true;
                this.buildDateView();
            }.observes( 'ltPropDisabledDates.[]' ),

            monthHeaderFormatObserver: function() {
                this.buildDateViewHeader();
            }.observes( 'ltPropMonthHeaderFormat' ),

            weekNumberObserver: function() {
                var parCalendar = this.$node;

                if( this.getData('ltPropWeekNumber') && this.getData('viewType') === 'dateView' ){
					if( !parCalendar.classList.contains('lyteWeekNumContainer')){
                    	parCalendar.classList.add( 'lyteWeekNumContainer' );
					}
                }
                else {
                    parCalendar.classList.remove( 'lyteWeekNumContainer' );
                }

            }.observes( 'ltPropWeekNumber', 'viewType' ).on( 'didConnect' )
        }), arg1);
    }

    _() {
        _;
    }
}

LyteCalendarComponent._template = "<template tag-name=\"lyte-calendar\"> <div class=\"{{containerClass}}\" ontouchstart=\"{{action('record',event)}}\" ontouchend=\"{{action('decide',event)}}\"> <div class=\"lyteCalendarView\"> <div> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{navYield}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-yield yield-name=\"navigator\"></lyte-yield> </template><template default=\"\"> <div class=\"lyteCalendarNavigator {{if(ifEquals(ltPropHeaderAlignType,&quot;centerdate&quot;),&quot;lyteCalHeaderCenterAlign&quot;,&quot;&quot;)}}\"> <span id=\"{{monthDropdownId}}\" class=\"lyteVisuallyHidden\">{{lyteUiI18n(\"lyte.calendar.choose.month\")}}</span> <span id=\"{{yearDropdownId}}\" class=\"lyteVisuallyHidden\">{{lyteUiI18n(\"lyte.calendar.choose.year\")}}</span> <span class=\"lyteVisuallyHidden\" aria-live=\"polite\" id=\"{{headerId}}\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(viewType,'===','dateView')}}\" is=\"case\" lc-id=\"lc_id_0\"> <span>{{lyteUiGetMonthOrYear(monthHeader,\"M\")}}</span><span>{{lyteUiGetMonthOrYear(monthHeader,\"Y\")}}</span> </template><template case=\"{{expHandlers(viewType,'===','monthView')}}\" is=\"case\" lc-id=\"lc_id_1\"> <span>{{currentYear}}</span> </template><template default=\"\"> <span>{{decadeStart}} - {{decadeEnd}}</span> </template></template> </span> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ifNotEquals(ltPropHeaderAlignType,&quot;centerdate&quot;)}}\" is=\"case\" lc-id=\"lc_id_0\"> <span class=\"lyteCalsCalMon\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(expHandlers(ltPropHeaderType,'===','dropdown'),'||',expHandlers(ltPropHeaderType,'===','picklist'))}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-dropdown lt-prop-aria-button=\"{{monthAriaObj}}\" lt-prop-freeze=\"false\" lt-prop=\"{{stringify(ltPropDropdown)}}\" on-show=\"{{method('setClass')}}\" class=\"lyteCalMonthDD\" on-option-selected=\"{{method('optionSelected','M')}}\"> <template is=\"registerYield\" yield-name=\"yield\"> <lyte-drop-box> <lyte-drop-body> <template items=\"{{monthNames}}\" item=\"item\" index=\"index\" is=\"for\" _new=\"true\"> <lyte-drop-item data-value=\"{{item}}\">{{item}}</lyte-drop-item> </template> </lyte-drop-body> </lyte-drop-box> </template> </lyte-dropdown> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(ltPropHeaderType,'===','dropdown')}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-dropdown lt-prop-aria-button=\"{{yearAriaObj}}\" lt-prop-freeze=\"false\" lt-prop=\"{{stringify(ltPropDropdown)}}\" on-show=\"{{method('setClass')}}\" class=\"lyteCalYearDD\" on-option-selected=\"{{method('optionSelected','Y')}}\"> <template is=\"registerYield\" yield-name=\"yield\"> <lyte-drop-box> <lyte-drop-body> <template items=\"{{years}}\" item=\"item\" index=\"index\" is=\"for\" _new=\"true\"> <lyte-drop-item data-value=\"{{item}}\">{{item}}</lyte-drop-item> </template> </lyte-drop-body> </lyte-drop-box> </template> </lyte-dropdown> </template><template default=\"\"> <lyte-picklist lt-prop-options=\"{{years}}\" lt-prop-dropdown=\"{&quot;freeze&quot;: false, &quot;callout&quot;: true}\" class=\"lyteCalYearDD\" on-option-select=\"{{method('optionSelected','Y')}}\" on-show=\"{{method('setClass')}}\"> </lyte-picklist> </template></template> </template><template case=\"{{expHandlers(ltPropHeaderType,'===','drilldown')}}\" is=\"case\" lc-id=\"lc_id_1\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(viewType,'===','dateView')}}\" is=\"case\" lc-id=\"lc_id_0\"> <span aria-label=\"{{lyteUiI18n('lyte.calendar.monthview.drilldown.button')}}\" tabindex=\"0\" role=\"button\" class=\"lyteDrillCalHeaderButton\" onclick=\"{{action('changeToMonthView',event)}}\" onkeydown=\"{{action('changeToMonthViewOnKeys',event)}}\"> <span class=\"lyteCalsCalMonth\">{{lyteUiGetMonthOrYear(monthHeader,\"M\")}}</span> <span class=\"lyteCalsCalYear\">{{lyteUiGetMonthOrYear(monthHeader,\"Y\")}}</span> </span> </template><template case=\"{{expHandlers(viewType,'===','monthView')}}\" is=\"case\" lc-id=\"lc_id_1\"> <span aria-label=\"{{lyteUiI18n('lyte.calendar.decadeview.drilldown.button')}}\" tabindex=\"0\" role=\"button\" class=\"lyteDrillCalHeaderButton\" onclick=\"{{action('changeToDecadeView',event)}}\" onkeydown=\"{{action('changeToDecadeViewOnKeys',event)}}\"> <span class=\"lyteCalsCalYear\">{{currentYear}}</span> </span> </template><template case=\"{{expHandlers(viewType,'===','decadeView')}}\" is=\"case\" lc-id=\"lc_id_2\"> <span class=\"lyteDrillCalHeaderButton lyteDrillCalYearListHeader\"> {{decadeStart}} - {{decadeEnd}} </span> </template></template> </template><template case=\"{{expHandlers(expHandlers(ltPropSelectionType,'===','month'),'||',expHandlers(ltPropSelectionType,'===','year'))}}\" is=\"case\" lc-id=\"lc_id_2\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(viewType,'===','monthView')}}\" is=\"case\" lc-id=\"lc_id_0\"> <span> <span class=\"lyteCalsCalYear\">{{currentYear}}</span> </span> </template><template case=\"{{expHandlers(viewType,'===','decadeView')}}\" is=\"case\" lc-id=\"lc_id_1\"> <span class=\"lyteDrillCalHeaderButton lyteDrillCalYearListHeader\"> {{decadeStart}} - {{decadeEnd}} </span> </template></template> </template><template default=\"\"> <span class=\"lyteCalsCalMonth\">{{lyteUiGetMonthOrYear(monthHeader,\"M\")}}</span> <span class=\"lyteCalsCalYear\">{{lyteUiGetMonthOrYear(monthHeader,\"Y\")}}</span> </template></template> </span> </template></template> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ifNotEquals(ltPropHeaderType,&quot;dropdown&quot;)}}\" is=\"case\" lc-id=\"lc_id_0\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(expHandlers(showYear,'&amp;&amp;',expHandlers(ltPropSelectionType,'!==','month')),'&amp;&amp;',expHandlers(ltPropSelectionType,'!==','year'))}}\" is=\"case\" lc-id=\"lc_id_0\"> <span role=\"button\" tabindex=\"0\" class=\"lyteCalNav lyteCalyearNavLft\" onclick=\"{{action('previous','Y',event)}}\" onkeydown=\"{{action('previousOnKeys','Y',event)}}\"> <span class=\"lyteVisuallyHidden\">{{lyteUiI18n('lyte.calendar.previous.year')}}</span> </span> </template></template> </template></template> <span role=\"button\" class=\"lyteCalNav lyteCaldLft {{lyteUiDisableCalendarNav(viewDate,'previous')}}\" tabindex=\"0\" onclick=\"{{action('previous','M',event)}}\" onkeydown=\"{{action('previousOnKeys','M',event)}}\"> <span class=\"lyteVisuallyHidden\">{{lyteUiI18n('lyte.calendar.previous.month')}}</span> </span> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ifEquals(ltPropHeaderAlignType,&quot;centerdate&quot;)}}\" is=\"case\" lc-id=\"lc_id_0\"> <span class=\"lyteCalsCalMon\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(expHandlers(ltPropHeaderType,'===','dropdown'),'||',expHandlers(ltPropHeaderType,'===','picklist'))}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-dropdown lt-prop-aria-button=\"{{monthAriaObj}}\" lt-prop-freeze=\"false\" lt-prop=\"{{stringify(ltPropDropdown)}}\" on-show=\"{{method('setClass')}}\" class=\"lyteCalMonthDD\" on-option-selected=\"{{method('optionSelected','M')}}\"> <template is=\"registerYield\" yield-name=\"yield\"> <lyte-drop-box> <lyte-drop-body> <template items=\"{{monthNames}}\" item=\"item\" index=\"index\" is=\"for\" _new=\"true\"> <lyte-drop-item data-value=\"{{item}}\">{{item}}</lyte-drop-item> </template> </lyte-drop-body> </lyte-drop-box> </template> </lyte-dropdown> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(ltPropHeaderType,'===','dropdown')}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-dropdown lt-prop-aria-button=\"{{yearAriaObj}}\" lt-prop-freeze=\"false\" lt-prop=\"{{stringify(ltPropDropdown)}}\" on-show=\"{{method('setClass')}}\" class=\"lyteCalYearDD\" on-option-selected=\"{{method('optionSelected','Y')}}\"> <template is=\"registerYield\" yield-name=\"yield\"> <lyte-drop-box> <lyte-drop-body> <template items=\"{{years}}\" item=\"item\" index=\"index\" is=\"for\" _new=\"true\"> <lyte-drop-item data-value=\"{{item}}\">{{item}}</lyte-drop-item> </template> </lyte-drop-body> </lyte-drop-box> </template> </lyte-dropdown> </template><template default=\"\"> <lyte-picklist lt-prop-options=\"{{years}}\" lt-prop-dropdown=\"{&quot;freeze&quot;: false, &quot;callout&quot;: true}\" class=\"lyteCalYearDD\" on-option-select=\"{{method('optionSelected','Y')}}\" on-show=\"{{method('setClass')}}\"> </lyte-picklist> </template></template> </template><template case=\"{{expHandlers(ltPropHeaderType,'===','drilldown')}}\" is=\"case\" lc-id=\"lc_id_1\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(viewType,'===','dateView')}}\" is=\"case\" lc-id=\"lc_id_0\"> <span aria-label=\"{{lyteUiI18n('lyte.calendar.monthview.drilldown.button')}}\" tabindex=\"0\" role=\"button\" class=\"lyteDrillCalHeaderButton\" onclick=\"{{action('changeToMonthView',event)}}\" onkeydown=\"{{action('changeToMonthViewOnKeys',event)}}\"> <span class=\"lyteCalsCalMonth\">{{lyteUiGetMonthOrYear(monthHeader,\"M\")}}</span> <span class=\"lyteCalsCalYear\">{{lyteUiGetMonthOrYear(monthHeader,\"Y\")}}</span> </span> </template><template case=\"{{expHandlers(viewType,'===','monthView')}}\" is=\"case\" lc-id=\"lc_id_1\"> <span aria-label=\"{{lyteUiI18n('lyte.calendar.decadeview.drilldown.button')}}\" tabindex=\"0\" role=\"button\" class=\"lyteDrillCalHeaderButton\" onclick=\"{{action('changeToDecadeView',event)}}\" onkeydown=\"{{action('changeToDecadeViewOnKeys',event)}}\"> <span class=\"lyteCalsCalYear\">{{currentYear}}</span> </span> </template><template case=\"{{expHandlers(viewType,'===','decadeView')}}\" is=\"case\" lc-id=\"lc_id_2\"> <span class=\"lyteDrillCalHeaderButton lyteDrillCalYearListHeader\"> {{decadeStart}} - {{decadeEnd}} </span> </template></template> </template><template case=\"{{expHandlers(expHandlers(ltPropSelectionType,'===','month'),'||',expHandlers(ltPropSelectionType,'===','year'))}}\" is=\"case\" lc-id=\"lc_id_2\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(viewType,'===','monthView')}}\" is=\"case\" lc-id=\"lc_id_0\"> <span> <span class=\"lyteCalsCalYear\">{{currentYear}}</span> </span> </template><template case=\"{{expHandlers(viewType,'===','decadeView')}}\" is=\"case\" lc-id=\"lc_id_1\"> <span class=\"lyteDrillCalHeaderButton lyteDrillCalYearListHeader\"> {{decadeStart}} - {{decadeEnd}} </span> </template></template> </template><template default=\"\"> <span class=\"lyteCalsCalMonth\">{{lyteUiGetMonthOrYear(monthHeader,\"M\")}}</span> <span class=\"lyteCalsCalYear\">{{lyteUiGetMonthOrYear(monthHeader,\"Y\")}}</span> </template></template> </span> </template></template> <span role=\"button\" class=\"lyteCalNav lyteCaldRgt {{lyteUiDisableCalendarNav(viewDate,'next')}}\" tabindex=\"0\" onkeydown=\"{{action('nextOnKeys','M',event)}}\" onclick=\"{{action('next','M',event)}}\"> <span class=\"lyteVisuallyHidden\">{{lyteUiI18n('lyte.calendar.next.month')}}</span> </span> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ifNotEquals(ltPropHeaderType,&quot;dropdown&quot;)}}\" is=\"case\" lc-id=\"lc_id_0\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(expHandlers(showYear,'&amp;&amp;',expHandlers(ltPropSelectionType,'!==','month')),'&amp;&amp;',expHandlers(ltPropSelectionType,'!==','year'))}}\" is=\"case\" lc-id=\"lc_id_0\"> <span role=\"button\" class=\"lyteCalNav lyteCalyearNavRgt\" tabindex=\"0\" onkeydown=\"{{action('nextOnKeys','Y',event)}}\" onclick=\"{{action('next','Y',event)}}\"> <span class=\"lyteVisuallyHidden\">{{lyteUiI18n('lyte.calendar.next.year')}}</span> </span> </template></template> </template></template> </div> </template></template> </div> <div class=\"lyteCalTableContainer\" role=\"grid\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropBodyYield}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-yield yield-name=\"body\"></lyte-yield> </template><template default=\"\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(viewType,'===','dateView')}}\" is=\"case\" lc-id=\"lc_id_0\"> <div role=\"row\" class=\"lyteCalTableRowHeader\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropWeekNumber}}\" is=\"case\" lc-id=\"lc_id_0\"> <div role=\"columnheader\" class=\"lyteCalTableCellHeader lyteWeekNumberGrid\"><span>{{ltPropWeekNumHeader}}</span></div> </template></template> <template items=\"{{daysOfWeek}}\" item=\"day\" index=\"idod\" is=\"for\" _new=\"true\"> <div role=\"columnheader\" aria-label=\"{{day.title}}\" class=\"{{day.class}}\" id=\"{{day.id}}\">{{lyteUiI18n(day.day)}}</div> </template> </div> </template></template> <div class=\"lyteCalTableRowGroup\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(viewType,'===','dateView')}}\" is=\"case\" lc-id=\"lc_id_0\"> <template items=\"{{matrix}}\" item=\"vector\" index=\"rowid\" is=\"for\" _new=\"true\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(lyteUiCheckEmpty(vector),'!')}}\" is=\"case\" lc-id=\"lc_id_0\"> <div class=\"lyteCalTableRow\" role=\"row\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropWeekNumber}}\" is=\"case\" lc-id=\"lc_id_0\"> <div role=\"gridcell\" tabindex=\"-1\" class=\"{{weeknum[rowid].class}}\" lt-prop-title=\"Week Number\" lt-prop-tooltip-config=\"{&quot;position&quot; : &quot;right&quot;, &quot;appearance&quot; : &quot;box&quot;}\"><span>{{if(ifNotEquals(weeknum[rowid].val,0),weeknum[rowid].val,'')}}</span></div> </template></template> <template items=\"{{vector}}\" item=\"date\" index=\"cellid\" is=\"for\" _new=\"true\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(lyteUiCheckInRange(ltPropMinDate,ltPropMaxDate,date.val,ltPropFormat),'&amp;&amp;',expHandlers(lyteUiDisabledDates(date,ltPropDisabledDates),'!'))}}\" is=\"case\" lc-id=\"lc_id_0\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{date.emptyBlock}}\" is=\"case\" lc-id=\"lc_id_0\"> <div role=\"gridcell\" class=\"lyteCalEmpty\" data-selectable=\"false\"></div> </template><template default=\"\"> <div role=\"gridcell\" tabindex=\"-1\" id=\"{{date.id}}\" aria-labelledby=\"{{concat(date.id,' ',headerId,' ',daysOfWeek[cellid]['id'])}}\" onkeydown=\"{{action('performNavigation',event)}}\" onclick=\"{{action('dateSelected',event)}}\" class=\"{{date.clsname}}\" data-date=\"{{date.val}}\" data-selectable=\"true\"><span class=\"lyteCalDateSpan\">{{date.date}}</span></div> </template></template> </template><template default=\"\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{date.emptyBlock}}\" is=\"case\" lc-id=\"lc_id_0\"> <div role=\"gridcell\" class=\"lyteCalEmpty\" data-selectable=\"false\"></div> </template><template default=\"\"> <div role=\"gridcell\" tabindex=\"-1\" id=\"{{date.id}}\" aria-labelledby=\"{{concat(date.id,' ',headerId,' ',daysOfWeek[cellid]['id'])}}\" aria-disabled=\"true\" onkeydown=\"{{action('performNavigation',event)}}\" data-date=\"{{date.val}}\" class=\"{{date.clsname}}\" data-selectable=\"false\"><span class=\"lyteCalDateSpan\">{{date.date}}</span></div> </template></template> </template></template> </template> </div> </template></template> </template> </template><template case=\"{{expHandlers(viewType,'===','monthView')}}\" is=\"case\" lc-id=\"lc_id_1\"> <template items=\"{{monthViewData}}\" item=\"row\" index=\"rowIndex\" is=\"for\" _new=\"true\"> <div class=\"lyteCalTableRow\"> <template items=\"{{row}}\" item=\"column\" index=\"columnIndex\" is=\"for\" _new=\"true\"> <div aria-label=\"{{lyteUiI18n(lyteUiGetLinearIndex(ariaMonthNames,rowIndex,columnIndex))}}\" role=\"gridcell\" tabindex=\"-1\" onkeydown=\"{{action('performNavigation',event)}}\" onclick=\"{{action('monthSelected',event)}}\" class=\"{{column['class']}}\" data-date=\"{{column['systemValue']}}\"> {{column['displayValue']}} </div> </template> </div> </template> </template><template case=\"{{expHandlers(viewType,'===','decadeView')}}\" is=\"case\" lc-id=\"lc_id_2\"> <template items=\"{{decadeViewData}}\" item=\"row\" index=\"rowIndex\" is=\"for\" _new=\"true\"> <div class=\"lyteCalTableRow\"> <template items=\"{{row}}\" item=\"column\" index=\"columnIndex\" is=\"for\" _new=\"true\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(column.emptyBlock,'!')}}\" is=\"case\" lc-id=\"lc_id_0\"> <div role=\"gridcell\" tabindex=\"-1\" onkeydown=\"{{action('performNavigation',event)}}\" onclick=\"{{action('yearSelected',event)}}\" class=\"lyteCalTableCell {{column.class}}\" data-date=\"{{column.year}}\"> {{column.year}} </div> </template><template default=\"\"> <div role=\"gridcell\" class=\"lyteCalEmpty\"> </div> </template></template> </template> </div> </template> </template></template> </div> </template></template> </div> <div> <div class=\"lyteCalBtns\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(expHandlers(showToday,'&amp;&amp;',ltPropShowToday),'&amp;&amp;',expHandlers(viewType,'===','monthView'))}}\" is=\"case\" lc-id=\"lc_id_0\"> <p role=\"button\" tabindex=\"0\" onkeydown=\"{{action('curMonthOnKey',event)}}\" class=\"lyteCalCurrentDate\"><a onclick=\"{{action('curMonth',event)}}\">{{lyteUiI18n('Current Month')}}</a></p> </template><template case=\"{{expHandlers(expHandlers(showToday,'&amp;&amp;',ltPropShowToday),'&amp;&amp;',expHandlers(viewType,'===','decadeView'))}}\" is=\"case\" lc-id=\"lc_id_1\"> <p role=\"button\" tabindex=\"0\" onkeydown=\"{{action('curYearOnKey',event)}}\" class=\"lyteCalCurrentDate\"><a onclick=\"{{action('curYear',event)}}\">{{lyteUiI18n('Current Year')}}</a></p> </template><template case=\"{{expHandlers(expHandlers(expHandlers(showToday,'&amp;&amp;',ltPropShowToday),'&amp;&amp;',expHandlers(viewType,'===','dateView')),'&amp;&amp;',expHandlers(ltPropSelectionType,'===','week'))}}\" is=\"case\" lc-id=\"lc_id_2\"> <p role=\"button\" tabindex=\"0\" onkeydown=\"{{action('curWeekOnKey',event)}}\" class=\"lyteCalCurrentDate\"><a onclick=\"{{action('curWeek',event)}}\">{{lyteUiI18n('Current Week')}}</a></p> </template><template case=\"{{expHandlers(showToday,'&amp;&amp;',ltPropShowToday)}}\" is=\"case\" lc-id=\"lc_id_3\"> <p role=\"button\" tabindex=\"0\" onkeydown=\"{{action('todayOnKey',event)}}\" class=\"lyteCalCurrentDate\"><a onclick=\"{{action('today',event)}}\">{{lyteUiI18n('today')}}</a></p> </template></template> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropYield}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-yield yield-name=\"footer\"></lyte-yield> </template></template> </div> </div> </div> </div> </template>";;
LyteCalendarComponent._dynamicNodes = [{"t":"a","p":[1]},{"t":"s","p":[1,1,1,1],"c":{"lc_id_0":{"dN":[{"t":"i","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"a","p":[1],"cn":"default"},{"t":"a","p":[1,1],"cn":"default"},{"t":"tX","p":[1,1,0],"cn":"default"},{"t":"a","p":[1,3],"cn":"default"},{"t":"tX","p":[1,3,0],"cn":"default"},{"t":"a","p":[1,5],"cn":"default"},{"t":"s","p":[1,5,1],"c":{"lc_id_0":{"dN":[{"t":"tX","p":[1,0],"cn":"lc_id_0"},{"t":"tX","p":[2,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true},"lc_id_1":{"dN":[{"t":"tX","p":[1,0],"cn":"lc_id_1"}],"cdp":{"t":"a","p":[1]},"dcn":true}},"d":{"dN":[{"t":"tX","p":[1,0],"cn":"default"},{"t":"tX","p":[1,2],"cn":"default"}]},"dc":{"lc_id_0":{},"lc_id_1":{},"default":{}},"hd":true,"co":["lc_id_0","lc_id_1"],"in":4,"sibl":[3],"cn":"default"},{"t":"s","p":[1,7],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1,1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"r","p":[1,1],"dN":[{"t":"a","p":[1,1,1]},{"t":"f","p":[1,1,1],"dN":[{"t":"a","p":[1]},{"t":"tX","p":[1,0]},{"t":"cD","p":[1],"in":0}],"dc":[0],"hc":true,"trans":true,"in":2,"sibl":[1]},{"t":"cD","p":[1,1],"in":1,"sibl":[0]},{"t":"cD","p":[1],"in":0}],"dc":[2,1,0],"hc":true,"trans":true,"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"s","p":[3],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"r","p":[1,1],"dN":[{"t":"a","p":[1,1,1]},{"t":"f","p":[1,1,1],"dN":[{"t":"a","p":[1]},{"t":"tX","p":[1,0]},{"t":"cD","p":[1],"in":0}],"dc":[0],"hc":true,"trans":true,"in":2,"sibl":[1]},{"t":"cD","p":[1,1],"in":1,"sibl":[0]},{"t":"cD","p":[1],"in":0}],"dc":[2,1,0],"hc":true,"trans":true,"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"a","p":[1],"cn":"default"},{"t":"cD","p":[1],"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[1,0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true},"lc_id_1":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"tX","p":[1,1,0],"cn":"lc_id_0"},{"t":"tX","p":[1,3,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true},"lc_id_1":{"dN":[{"t":"a","p":[1],"cn":"lc_id_1"},{"t":"tX","p":[1,1,0],"cn":"lc_id_1"}],"cdp":{"t":"a","p":[1]},"dcn":true},"lc_id_2":{"dN":[{"t":"tX","p":[1,1],"cn":"lc_id_2"},{"t":"tX","p":[1,3],"cn":"lc_id_2"}],"cdp":{"t":"a","p":[2]},"dcn":true}},"d":{},"dc":{"lc_id_0":{},"lc_id_1":{},"lc_id_2":{}},"hd":true,"co":["lc_id_0","lc_id_1","lc_id_2"],"cn":"lc_id_1"}],"cdp":{"t":"a","p":[1]},"dcn":true},"lc_id_2":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"tX","p":[1,1,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true},"lc_id_1":{"dN":[{"t":"tX","p":[1,1],"cn":"lc_id_1"},{"t":"tX","p":[1,3],"cn":"lc_id_1"}],"cdp":{"t":"a","p":[1]},"dcn":true}},"d":{},"dc":{"lc_id_0":{},"lc_id_1":{}},"hd":true,"co":["lc_id_0","lc_id_1"],"cn":"lc_id_2"}],"cdp":{"t":"a","p":[2]},"dcn":true}},"d":{"dN":[{"t":"tX","p":[1,0],"cn":"default"},{"t":"tX","p":[3,0],"cn":"default"}]},"dc":{"lc_id_0":{"dc":[2,1,0],"hc":true,"trans":true},"lc_id_1":{},"lc_id_2":{},"default":{}},"hd":true,"co":["lc_id_0","lc_id_1","lc_id_2"],"hc":true,"trans":true,"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":3,"sibl":[2],"cn":"default"},{"t":"s","p":[1,9],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"tX","p":[1,1,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{}},"hd":true,"co":["lc_id_0"],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{}},"hd":true,"co":["lc_id_0"],"in":2,"sibl":[1],"cn":"default"},{"t":"a","p":[1,11],"cn":"default"},{"t":"tX","p":[1,11,1,0],"cn":"default"},{"t":"s","p":[1,13],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1,1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"r","p":[1,1],"dN":[{"t":"a","p":[1,1,1]},{"t":"f","p":[1,1,1],"dN":[{"t":"a","p":[1]},{"t":"tX","p":[1,0]},{"t":"cD","p":[1],"in":0}],"dc":[0],"hc":true,"trans":true,"in":2,"sibl":[1]},{"t":"cD","p":[1,1],"in":1,"sibl":[0]},{"t":"cD","p":[1],"in":0}],"dc":[2,1,0],"hc":true,"trans":true,"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"s","p":[3],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"r","p":[1,1],"dN":[{"t":"a","p":[1,1,1]},{"t":"f","p":[1,1,1],"dN":[{"t":"a","p":[1]},{"t":"tX","p":[1,0]},{"t":"cD","p":[1],"in":0}],"dc":[0],"hc":true,"trans":true,"in":2,"sibl":[1]},{"t":"cD","p":[1,1],"in":1,"sibl":[0]},{"t":"cD","p":[1],"in":0}],"dc":[2,1,0],"hc":true,"trans":true,"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"a","p":[1],"cn":"default"},{"t":"cD","p":[1],"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[1,0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true},"lc_id_1":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"tX","p":[1,1,0],"cn":"lc_id_0"},{"t":"tX","p":[1,3,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true},"lc_id_1":{"dN":[{"t":"a","p":[1],"cn":"lc_id_1"},{"t":"tX","p":[1,1,0],"cn":"lc_id_1"}],"cdp":{"t":"a","p":[1]},"dcn":true},"lc_id_2":{"dN":[{"t":"tX","p":[1,1],"cn":"lc_id_2"},{"t":"tX","p":[1,3],"cn":"lc_id_2"}],"cdp":{"t":"a","p":[2]},"dcn":true}},"d":{},"dc":{"lc_id_0":{},"lc_id_1":{},"lc_id_2":{}},"hd":true,"co":["lc_id_0","lc_id_1","lc_id_2"],"cn":"lc_id_1"}],"cdp":{"t":"a","p":[1]},"dcn":true},"lc_id_2":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"tX","p":[1,1,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true},"lc_id_1":{"dN":[{"t":"tX","p":[1,1],"cn":"lc_id_1"},{"t":"tX","p":[1,3],"cn":"lc_id_1"}],"cdp":{"t":"a","p":[1]},"dcn":true}},"d":{},"dc":{"lc_id_0":{},"lc_id_1":{}},"hd":true,"co":["lc_id_0","lc_id_1"],"cn":"lc_id_2"}],"cdp":{"t":"a","p":[2]},"dcn":true}},"d":{"dN":[{"t":"tX","p":[1,0],"cn":"default"},{"t":"tX","p":[3,0],"cn":"default"}]},"dc":{"lc_id_0":{"dc":[2,1,0],"hc":true,"trans":true},"lc_id_1":{},"lc_id_2":{},"default":{}},"hd":true,"co":["lc_id_0","lc_id_1","lc_id_2"],"hc":true,"trans":true,"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":1,"sibl":[0],"cn":"default"},{"t":"a","p":[1,15],"cn":"default"},{"t":"tX","p":[1,15,1,0],"cn":"default"},{"t":"s","p":[1,17],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"tX","p":[1,1,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{}},"hd":true,"co":["lc_id_0"],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{}},"hd":true,"co":["lc_id_0"],"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{"dc":[3,1],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":3,"sibl":[2]},{"t":"s","p":[1,1,3,1],"c":{"lc_id_0":{"dN":[{"t":"i","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1,1],"c":{"lc_id_0":{"dN":[{"t":"tX","p":[1,0,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{}},"hd":true,"co":["lc_id_0"],"sibl":[0],"cn":"lc_id_0"},{"t":"a","p":[1,3],"cn":"lc_id_0"},{"t":"f","p":[1,3],"dN":[{"t":"a","p":[1]},{"t":"tX","p":[1,0]}],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{}},"hd":true,"co":["lc_id_0"],"sibl":[0],"cn":"default"},{"t":"s","p":[3,1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"f","p":[1],"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1,1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"tX","p":[1,0,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{}},"hd":true,"co":["lc_id_0"],"sibl":[0],"cn":"lc_id_0"},{"t":"a","p":[1,3],"cn":"lc_id_0"},{"t":"f","p":[1,3],"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"a","p":[1],"cn":"default"},{"t":"tX","p":[1,0,0],"cn":"default"}]},"dc":{"lc_id_0":{},"default":{}},"hd":true,"co":["lc_id_0"],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"a","p":[1],"cn":"default"},{"t":"tX","p":[1,0,0],"cn":"default"}]},"dc":{"lc_id_0":{},"default":{}},"hd":true,"co":["lc_id_0"],"cn":"default"}]},"dc":{"lc_id_0":{},"default":{}},"hd":true,"co":["lc_id_0"]}],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{}},"hd":true,"co":["lc_id_0"]}],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true},"lc_id_1":{"dN":[{"t":"a","p":[1],"cn":"lc_id_1"},{"t":"f","p":[1],"dN":[{"t":"a","p":[1,1]},{"t":"f","p":[1,1],"dN":[{"t":"a","p":[1]},{"t":"tX","p":[1,1]}]}],"cn":"lc_id_1"}],"cdp":{"t":"a","p":[1]},"dcn":true},"lc_id_2":{"dN":[{"t":"a","p":[1],"cn":"lc_id_2"},{"t":"f","p":[1],"dN":[{"t":"a","p":[1,1]},{"t":"f","p":[1,1],"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"tX","p":[1,1],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[]},"dc":{"lc_id_0":{},"default":{}},"hd":true,"co":["lc_id_0"]}]}],"cn":"lc_id_2"}],"cdp":{"t":"a","p":[2]},"dcn":true}},"d":{},"dc":{"lc_id_0":{},"lc_id_1":{},"lc_id_2":{}},"hd":true,"co":["lc_id_0","lc_id_1","lc_id_2"],"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":2,"sibl":[1]},{"t":"s","p":[1,1,5,1,1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"a","p":[1,0],"cn":"lc_id_0"},{"t":"tX","p":[1,0,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true},"lc_id_1":{"dN":[{"t":"a","p":[1],"cn":"lc_id_1"},{"t":"a","p":[1,0],"cn":"lc_id_1"},{"t":"tX","p":[1,0,0],"cn":"lc_id_1"}],"cdp":{"t":"a","p":[1]},"dcn":true},"lc_id_2":{"dN":[{"t":"a","p":[1],"cn":"lc_id_2"},{"t":"a","p":[1,0],"cn":"lc_id_2"},{"t":"tX","p":[1,0,0],"cn":"lc_id_2"}],"cdp":{"t":"a","p":[2]},"dcn":true},"lc_id_3":{"dN":[{"t":"a","p":[1],"cn":"lc_id_3"},{"t":"a","p":[1,0],"cn":"lc_id_3"},{"t":"tX","p":[1,0,0],"cn":"lc_id_3"}],"cdp":{"t":"a","p":[3]},"dcn":true}},"d":{},"dc":{"lc_id_0":{},"lc_id_1":{},"lc_id_2":{},"lc_id_3":{}},"hd":true,"co":["lc_id_0","lc_id_1","lc_id_2","lc_id_3"],"in":1,"sibl":[0]},{"t":"s","p":[1,1,5,1,3],"c":{"lc_id_0":{"dN":[{"t":"i","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0},{"type":"dc","trans":true,"hc":true,"p":[3,2,0]}];;

LyteCalendarComponent._observedAttributes = [
    "ltPropStartDate",
    "ltPropEndDate",
    "ltPropCurrentDate",
    "ltPropFormat",
    "ltPropYear",
    "ltPropMonthHeaderFormat",
    "daysOfWeek",
    "ariaMonthNames",
    "monthSystemValues",
    "monthNames",
    "shortHands",
    "todayName",
    "viewDate",
    "changeData",
    "ltPropYield",
    "ltPropMinDate",
    "ltPropMaxDate",
    "ltPropStartWeekDay",
    "navYield",
    "selectDate",
    "currentDatechanged",
    "ltPropFillRows",
    "ltPropNumberOfRows",
    "callFrmDidcnct",
    "monthDD",
    "yearDD",
    "years",
    "ltPropHeaderType",
    "ltPropDropdown",
    "cords",
    "start",
    "prev",
    "tt",
    "showToday",
    "monthViewTableArray",
    "ltPropBodyYield",
    "ltPropShowToday",
    "ltPropI18n",
    "ltPropActivateNavigation",
    "ltPropDisableNavigation",
    "ltPropPreventAddingRows",
    "ltPropSelectionType",
    "ltPropWeekends",
    "ltPropCurrentWeek",
    "ltPropCurrentMonth",
    "ltPropCurrentYear",
    "ltPropDisabledDates",
    "ltPropCurrentDates",
    "ltPropMultiple",
    "headerId",
    "monthDropdownId",
    "yearDropdownId",
    "ltPropIso",
    "ltPropWeekNumCriteria",
    "ltPropHolidays",
    "ltPropDisableWeekends",
    "ltPropDisableHolidays",
    "ltPropWeekNumber",
    "ltPropAlwaysShowToday",
    "ltPropHighlightWeekendHolidays",
    "ltPropTimeZone",
    "ltPropDisabledDays",
    "ltPropHeaderAlignType",
    "ltPropWeekNumHeader",
    "showYear",
    "ltPropCurrentDisplayMonth",
    "ltPropCurrentDisplayYear",
    "ltPropCurrentDisplayDecade"
];

/**
 * @syntax nonYielded
 * <lyte-calendar></lyte-calendar>
 */

/**
 * @syntax yielded
 * <lyte-calendar>
 *     <template is="registerYield" yield-name="footer">
 *         <span>Footer Of The Calendar</span>
 *     </template>
 * </lyte-calendar>
 */

export { LyteCalendarComponent };

LyteCalendarComponent.register("lyte-calendar", {
    hash: "LyteCalendarComponent_10",
    refHash: "C_lyte-ui-component_@zoho/lyte-ui-component_2"
});
