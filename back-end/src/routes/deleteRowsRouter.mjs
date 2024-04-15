import Student from '../schemas/studentSchema.mjs';

const deleteRowsRouter = async(req, res) => {

  const { selectedNNumbers } = req.body;

    try {
        // Select documents where 'NNumber' is in the 'selectedNNumbers' array
        // const deletionResult = await Student.deleteMany({ NNumber: { $in: selectedNNumbers } });
        const softDeleteResult = await Student.updateMany(
            { NNumber: { $in: selectedNNumbers } },
            { $set: { deleted: true, deletedAt: new Date() } }
          );

        if (softDeleteResult.nModified > 0) {
            res.status(200).json({ message: `${softDeleteResult.nModified} rows marked as deleted.`  });
        } else {
            res.status(404).json({ message: "No rows found to delete." });
        }
    } catch (error) {
        console.error("Deletion error:", error);
        res.status(500).json({ message: "Internal server error during deletion." });
    }
}

export default deleteRowsRouter;