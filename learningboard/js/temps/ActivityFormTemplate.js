define(['util', './Template', 'ckeditor'], function (util, Template) {
  'use strict';

  /**
   * @constructor
   * @param {string} name - Activity type, human readable name
   * @param {string} type - Activity type, also act as a namespace
   */
  var ActivityFormTemplate = function(name, type) {
    this.name = name;
    this.type = type ? type.toLowerCase() : type;
    this.afterCreateCallback;
    this.afterEditCallback;

    var html = `
    <div role="tabpanel" class="tab-pane" id="${this.type}">
      <form class="addActivityForm">
        <input type="hidden" name="id" value="">
        <input type="hidden" name="lb" value="">
        <input type="hidden" name="type" value="${this.type}">
        <div class="form-group">
          <label for="${this.type}_title">Title<span class="text-danger">*</span></label>
          <input type="text" class="form-control" id="${this.type}_title" name="title" placeholder="activity title" required>
        </div>
        <div class="customForm"></div>
        <div class="form-group">
          <label for="${this.type}_description">Description</label>
          <textarea class="form-control" id="${this.type}_description" name="description" rows="3" placeholder="Description"></textarea>
        </div>
        <p><span class="text-danger">*</span> Indicates required field</p>
        <button type="submit" class="btn btn-default addActivityBtn">Submit</button>
        <button type="button" class="btn btn-default cancelActivityBtn">Cancel</button>
        <span class="result_msg"></span>
      </form>
    </div>`;
    Template.call(this, $(html));

    var $this = this;

    this.$template
    .off('click', '.addActivityBtn')
    .on('click', '.addActivityBtn', function(e){
      // trigger html5 validation
      if ($(this).parents('form.addActivityForm')[0].checkValidity()) {
        e.preventDefault();
      } else {
        return;
      }

      // Check data on custom form
      if (!$this.isFormDataValid()) {
        return;
      }

      var dataObject = $this.serializeObject();

      if ($this.$template.find('[name=id]').val()) { // edit mode
        util.put('/activity/' + dataObject.id, dataObject, function(res) {
          var act = res.data.activity;

          // clear form data
          $this.reset();

          if (typeof $this.afterEditCallback === 'function') {
            console.log("after edit callback");
            $this.afterEditCallback(act);
          }

          $this.$template.find('.result_msg').text('Activity edited!')
          .delay(1000).fadeOut('fast', function() {
            $(this).text('');
          });
        });
      } else { // create mode
        util.post('/activity', dataObject, function(res) {
          var act = res.data.activity;

          // clear form data
          $this.reset();

          if (typeof $this.afterCreateCallback === 'function') {
            $this.afterCreateCallback(act);
          }

          $this.$template.find('.result_msg').text('Activity added!')
          .delay(1000).fadeOut('fast', function(){
            $(this).text('');
          });
        });
      }
    });

    this.$template
    .off('click', '.cancelActivityBtn')
    .on('click', '.cancelActivityBtn', function(){
      $this.reset();
    });
  };

  ActivityFormTemplate.prototype.reset = function() {
    var editorName = this.$template.find('[name=description]').attr('id');
    CKEDITOR.instances[editorName].setData('');
    this.$template.find('[name=id]').val('');
    this.$template.find('form')[0].reset();
  };

  ActivityFormTemplate.prototype.setLBId = function(id) {
    this.$template.find('[name=lb]').val(id);
  };

  ActivityFormTemplate.prototype.setData = function(act) {
    this.$template.find('[name=id]').val(act.id);
    this.$template.find('[name=title]').val(act.title);
    var editorName = this.$template.find('[name=description]').attr('id');
    CKEDITOR.instances[editorName].setData(act.description);
    for (var key in act.data) {
      this.$template.find(`[name="${key}"]`).val(act.data[key]);
    }
  };

  ActivityFormTemplate.prototype.setAfterCreate = function(callback) {
    this.afterCreateCallback = callback;
  };

  ActivityFormTemplate.prototype.setAfterEdit = function(callback) {
    this.afterEditCallback = callback;
  };

  ActivityFormTemplate.prototype.isFormDataValid = function() {
    return true;
  }

  ActivityFormTemplate.prototype.serializeObject = function() {
    var data = this.$template.find("form.addActivityForm").serializeObject();
    data.id = data.id || undefined;
    data.lb = data.lb || null;
    var editorName = this.$template.find('[name=description]').attr('id');
    data.description = CKEDITOR.instances[editorName].getData();
    return data;
  };

  $.extend(ActivityFormTemplate.prototype, Template.prototype);

  ActivityFormTemplate.prototype.display = function() {
    Template.prototype.display.apply(this, arguments);

    var editorName = this.$template.find('[name=description]').attr('id');
    CKEDITOR.plugins.addExternal('autolink', util.getAppRootUrl() + '/js/lib/ckeditor/plugins/autolink/', 'plugin.js');
    CKEDITOR.plugins.addExternal('autoiframe', util.getAppRootUrl() + '/js/lib/ckeditor/plugins/autoiframe/', 'plugin.js');
    CKEDITOR.replace(editorName, {
      language: 'en',
      extraPlugins: 'autolink,autoiframe,iframe,colorbutton,colordialog,specialchar',
      removePlugins: 'sourcearea'
    });
  };

  return ActivityFormTemplate;
});
