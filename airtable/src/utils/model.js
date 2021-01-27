// Fonction préparant une méthode joignant une candidature à un apprenant
export const makeUpdateRecord = (table, field) => (record, value) =>
  table.updateRecordAsync(record, {
    [field.id]: value,
  });

// permet de transformer un record en données selon son model
export const transformRecordToData = (model) => (record) =>
  Object.keys(model).reduce(
    (acc, key) => ({
      ...acc,
      [key]: record.getCellValue(model[key]),
    }),
    {}
  );

export const loadView = async (
  { view, model, table, ...others },
  log = true
) => {
  const transformRecordToDataWithModel = transformRecordToData(model);
  const { records } = await view.selectRecordsAsync();
  if (log) {
    output.markdown(
      `✅ Vue "${view.name}"${table && ' de "' + table.name + '"'} chargée.`
    );
  }
  return {
    values: records.map((record) => ({
      record,
      data: transformRecordToDataWithModel(record),
    })),
    table,
    ...others,
  };
};
