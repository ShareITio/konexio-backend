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

export const loadView = async ({ view, model, ...others }) => {
  const { records } = await view.selectRecordsAsync();
  const data = records.map(transformRecordToData(model));
  output.markdown(`✅ Vue "${view.name}" chargée.`);
  return {
    records,
    data,
    ...others,
  };
};
