import Mn from 'backbone.marionette';
import Template from './template.hbs';
import Form from '../../components/form';
import React from 'react';
import ReactDOM from 'react-dom';
import SurveyModel from '../../surveys/add/model';
import SnapshotModel from './model';
import _ from 'lodash';

export default Mn.View.extend({
  template: Template,

  events: {
    'change #survey-id': 'onSurveySelectChange',
    'click #goback-btn': 'onGoBack'
  },

  initialize(options) {
    const { surveyId, handleCancel } = options;
    this.surveyModel = new SurveyModel({ id: surveyId });
    this.surveyModel.on('sync', () => this.renderForm());
    this.surveyModel.fetch();

    this.props = {};
    this.props.handleCancel = handleCancel;
    this.props.surveyId = surveyId;
  },

  getLocalizedSchema(unlocalizedSchema) {
    const newSchema = Object.assign({}, unlocalizedSchema);
    // schema = {
    //   properties: {
    //    XYZ:
    //        { title: { es : value},
    //          type: string
    //        }
    //   }
    // transformar a:
    // newSchema.properties.XYZ.title = value;
    const newProps = _.mapValues(newSchema.properties, obj => {
      // obj = XYZ
      return _.mapValues(obj, obj2 => {
        // obj2 = title
        if (_.isObject(obj2) && obj2.hasOwnProperty('es')) {
          return obj2.es;
        }
        return obj2;
      });
    });
    newSchema.properties = newProps;
    return newSchema;
  },
  renderForm() {
    const placeHolder = this.$el.find('#new-survey')[0];
    const { survey_schema } = this.surveyModel.attributes;
    const localizedSchema = this.getLocalizedSchema(survey_schema);
    this.reactView = React.createElement(Form, {
      schema: localizedSchema,
      handleSubmit: this.hadleSubmit.bind(this),
      handleCancel: this.props.handleCancel,
      view: this
    });
    ReactDOM.unmountComponentAtNode(placeHolder);
    ReactDOM.render(this.reactView, placeHolder);
  },

  onGoBack() {
    this.props.handleCancel();
  },
  onSurveySelectChange() {
    this.renderForm();
  },
  getIndicators({ formData }) {
    return _.pick(
      formData,
      this.surveyModel.get('survey_ui_schema')['ui:group:indicators']
    );
  },
  getEconomics({ formData }) {
    return _.pick(
      formData,
      this.surveyModel.get('survey_ui_schema')['ui:group:economics']
    );
  },
  hadleSubmit(formResult) {
    const snapshot = {
      survey_id: this.props.surveyId,
      indicator_survey_data: this.getIndicators(formResult),
      economic_survey_data: this.getEconomics(formResult)
    };

    new SnapshotModel().save(snapshot).then(() => {
      this.props.handleCancel();
    });
  }
});
