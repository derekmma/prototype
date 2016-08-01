define(function() {
  var ListTemplate = function(templateList, $template, $inner_container)
  {
    this.templateList = templateList;
    // a list of Template objects

    this.$container = ($inner_container === undefined? $template: $inner_container);
    // a jQuery html element which contains all children templates

    this.$template = $template;
    this.length = templateList.length;
  };

  ListTemplate.prototype.display = function()
  {
    var outer_containers = arguments;
    if(this.templateList.length > 0)
    {
      this.$container.empty();
      for (var i = 0; i < this.templateList.length; ++i)
      {
        this.templateList[i].display(this.$container);
      }
    }
    for (var i = 0; i < arguments.length; ++i)
    {
      outer_containers[i].append(this.$template);
    }
  };

  ListTemplate.prototype.empty = function()
  {
    return this.length === 0;
  }

  ListTemplate.prototype.addElement = function(ele)
  {
    this.model.push(ele.model);
    this.templateList.push(ele);
    this.length++;

    if (this.length === 1)
    {
      this.$container.children(".noElement").remove();
    }
    ele.display(this.$container);
  }

  ListTemplate.prototype.updateElementAt = function(new_ele, index)
  {
    this.model[index] = new_ele.model;
    this.templateList[index].$template.replaceWith(new_ele.$template);
  }

  ListTemplate.prototype.removeElementAt = function(index, settings)
  {
    if (settings === undefined) settings = {};
    var $tmp = this.templateList[index].$template;
    console.log($tmp);
    if (settings.fadeOut)
    {
      $tmp.fadeOut('slow', function(){
        $tmp.remove();
      });
    }
    else {
      $tmp.remove();
    }
    this.templateList.splice(index, 1);
    this.model.splice(index, 1);

    this.length--;
    for (var ii = index; ii < this.length; ++ii)
    {
      this.templateList[ii].updateIndex(ii);
    }
  }

  function match(obj, condition)
  {
    for (var op in condition)
    {
      if (obj[op] !== condition[op]) return false;
    }
    return true;
  }

  ListTemplate.prototype.removeElementBy = function(filter, settings)
  {
    if (filter === undefined || $.isEmptyObject(filter)) return;
    for (var ii = 0; ii < this.length; ++ii)
    {
      if (match(this.model[ii], filter))
      {
        ListTemplate.prototype.removeElementAt.call(this, ii, settings);
      }
    }
  }

  return ListTemplate;
  
});
