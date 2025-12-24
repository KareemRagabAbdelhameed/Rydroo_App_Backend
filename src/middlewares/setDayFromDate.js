export function setDayFromDate(schema, options = {}) {
    const {
      dateField = "date",
      dayField = "day",
      locale = "en-US",
      format = "long",
    } = options;
  
    // Runs on save()
    schema.pre("save", function (next) {
      if (this[dateField]) {
        this[dayField] = this[dateField].toLocaleDateString(locale, {
          weekday: format,
        });
      }
      next();
    });
  
    // Runs on update queries
    schema.pre("findOneAndUpdate", function (next) {
      const update = this.getUpdate();
  
      if (update?.[dateField]) {
        update[dayField] = new Date(update[dateField]).toLocaleDateString(
          locale,
          { weekday: format }
        );
      }
  
      next();
    });
  }
  