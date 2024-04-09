import Student from '../schemas/studentSchema.mjs';

const deleteRowsRouter = async(req, res) => {

  const { selectedNNumbers } = req.body;

    try {
        // Select documents where 'NNumber' is in the 'selectedNNumbers' array
        const deletionResult = await Student.deleteMany({ NNumber: { $in: selectedNNumbers } });

        if (deletionResult.deletedCount > 0) {
            res.status(200).json({ message: `${deletionResult.deletedCount} rows deleted successfully.` });
        } else {
            res.status(404).json({ message: "No rows found to delete." });
        }
    } catch (error) {
        console.error("Deletion error:", error);
        res.status(500).json({ message: "Internal server error during deletion." });
    }
}

export default deleteRowsRouter;