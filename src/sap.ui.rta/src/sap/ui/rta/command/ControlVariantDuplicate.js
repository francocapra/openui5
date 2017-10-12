/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/rta/command/BaseCommand',
	'sap/ui/fl/changeHandler/BaseTreeModifier',
	'sap/ui/fl/Utils'
], function(BaseCommand, BaseTreeModifier, flUtils) {
	"use strict";

	/**
	 * Switch control variants
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.52
	 * @alias sap.ui.rta.command.ControlVariantDuplicate
	 */
	var ControlVariantDuplicate = BaseCommand.extend("sap.ui.rta.command.ControlVariantDuplicate", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				sourceVariantReference : {
					type : "string"
				},
				newVariantReference : {
					type : "string"
				},
				duplicateVariant : {
					type : "any"
				}
			},
			associations : {},
			events : {}
		}
	});

	ControlVariantDuplicate.prototype.MODEL_NAME = "$FlexVariants";

	ControlVariantDuplicate.prototype._getAppComponent = function(oElement) {
		if (!this._oControlAppComponent) {
			this._oControlAppComponent = oElement ? flUtils.getAppComponentForControl(oElement) : this.getSelector().appComponent;
		}
		return this._oControlAppComponent;
	};

	/**
	 * @override
	 */
	ControlVariantDuplicate.prototype.prepare = function(mFlexSettings, sVariantManagementReference) {
		this.sLayer = mFlexSettings.layer;
	};

	/**
	 * @public Triggers the duplication of a variant
	 * @returns {promise} Returns resolve after execution
	 */
	ControlVariantDuplicate.prototype.execute = function() {
		var oVariantManagementControl = this.getElement(),
			oAppComponent = this._getAppComponent(oVariantManagementControl),
			sSourceVariantReference = this.getSourceVariantReference(),
			sNewVariantReference = this.getNewVariantReference();

		if (!sNewVariantReference) {
			sNewVariantReference = flUtils.createDefaultFileName(sSourceVariantReference + "_Copy");
			this.setNewVariantReference(sNewVariantReference);
		}

		this.sVariantManagementReference = BaseTreeModifier.getSelector(oVariantManagementControl, oAppComponent).id;
		this.oModel = oAppComponent.getModel(this.MODEL_NAME);

		var mPropertyBag = {
				variantManagementControl : oVariantManagementControl,
				appComponent : oAppComponent,
				layer : this.sLayer,
				newVariantReference : sNewVariantReference,
				sourceVariantReference : sSourceVariantReference
		};

		return Promise.resolve(this.oModel._copyVariant(mPropertyBag))
			.then(function(oVariant){
				this.setDuplicateVariant(oVariant);
			}.bind(this));
	};

	/**
	 * @public Undo logic for the execution
	 * @returns {promise} Returns resolve after undo
	 */
	ControlVariantDuplicate.prototype.undo = function() {
		if (this.getDuplicateVariant()) {
			return Promise.resolve(this.oModel._removeVariant(this.getDuplicateVariant(), this.getSourceVariantReference(), this.sVariantManagementReference))
				.then(function() {
					this.setDuplicateVariant(null);
				}.bind(this));
		}
	};

	return ControlVariantDuplicate;

}, /* bExport= */true);