angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("container/iStevenMultiSelectContainer.html","<span class=\"multiSelect\" click-anywhere-but-here=\"offClick()\"><button ng-hide=\"hideSelect == \'true\'\" id=\"{{directiveId}}\" type=\"button\" ng-click=\"toggleCheckboxes( $event )\" ng-bind-html=\"buttonLabel\" ng-disabled=\"disable-button\"></button><div class=\"checkboxLayer\" ng-class=\"{\'show\': showDropdown || hideSelect == \'true\'}\"><div class=\"helperContainer\"><i-steven-multi-select-filters icon=\"icon\" lang=\"lang\" v-min-search-length=\"\" update-filter=\"\" search=\"search\" search-changed=\"onSearchChange()\" select-all=\"selectAll()\" select-none=\"selectNone()\" select=\"\"></i-steven-multi-select-filters></div><div class=\"checkBoxContainer\"><div ng-class=\"listCss\"><div ng-repeat=\"item in inputModel | isteven: search : ignoreProperties : filterProperties : maxLabels\" ng-if=\"checkIfGroupFalse(item)\"><i-steven-multi-select-list item=\"item\" tick-marker=\"{{icon.tickMark}}\" is-disabled=\"{{isDisabled == \'true\'}}\" disable-property=\"{{disableProperty}}\" index=\"{{$index}}\" tick-property=\"{{tickProperty}}\" orientation=\"{{orientation}}\" group-property=\"{{groupProperty}}\" spacing-property=\"{{spacingBasedOnGrouping[$index]}}\" item-label=\"{{itemLabel}}\"></i-steven-multi-select-list></div></div></div></div></span>");
$templateCache.put("list/iStevenMultiSelectList.html","<div class=\"multiSelectItem\" ng-class=\"{selected: item[ tickProperty ], horizontal: orientation !== \'v\', vertical: orientation === \'v\', multiSelectGroup:item[ groupProperty ], disabled:itemIsDisabled( item )}\" ng-click=\"onClickSyncItems( $event, $index );\" ng-mouseleave=\"removeStyle( \'multiSelectFocus\' );\"><div class=\"acol\" ng-if=\"spacingProperty > 0\" ng-repeat=\"i in numberToArray( spacingProperty ) track by $index\"></div><div class=\"acol\"><label><input class=\"checkbox focusable\" type=\"checkbox\" ng-disabled=\"itemIsDisabled( item )\" ng-checked=\"item[ tickProperty ]\" ng-click=\"syncItems( item, $event, $index )\"><span ng-class=\"{disabled:itemIsDisabled( item )}\" ng-bind-html=\"writeLabel(\'itemLabel\' )\"></span></label></div><span class=\"tickMark\" ng-if=\"item[ groupProperty ] !== true && item[ tickProperty ] === true\">&#10003;</span></div>");
$templateCache.put("filters/iStevenMultiSelectFilters.html","<div class=\"helperContainer\" ng-if=\"helperStatus.filter || helperStatus.all || helperStatus.none || helperStatus.reset\"><div class=\"line\" ng-if=\"helperStatus.all || helperStatus.none || helperStatus.reset\"><button type=\"button\" class=\"helperButton\" ng-if=\"!isDisabled && helperStatus.all\" ng-click=\"selectAll();\" ng-bind-html=\"generateHTMLSafeText(lang.selectAll)\"></button> <button type=\"button\" class=\"helperButton\" ng-if=\"!isDisabled && helperStatus.none\" ng-click=\"selectNone();\" ng-bind-html=\"generateHTMLSafeText(lang.selectNone)\"></button> <button type=\"button\" class=\"helperButton reset\" ng-if=\"!isDisabled && helperStatus.reset\" ng-click=\"select( reset, $event );\" ng-bind-html=\"generateHTMLSafeText(lang.reset)\"></button></div><div class=\"line\" style=\"position:relative\" ng-if=\"helperStatus.filter\"><input placeholder=\"{{::lang.search}}\" ng-change=\"searchChanged()\" type=\"text\" ng-click=\"select( \'filter\', $event )\" ng-model=\"search.name\" class=\"inputFilter\"> <button type=\"button\" class=\"clearButton\" ng-click=\"clearClicked( $event )\">×</button></div></div>");}]);