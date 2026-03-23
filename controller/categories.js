const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const categoryModel = require('../models/categories')
const { checkAccess } = require('../middleware/helperMiddleware')


const createCategory = async (req, res) => {
  try {
    if (!checkAccess(req, res, ["Admin"])) return;

    const { name } = req.body;


    if (!name) {
      return res.status(400).send({ message: "Category name is required." });
    }

    if (!req.file) {
      return res.status(400).send({ message: "Image is required." });
    }

    const existingCategory = await categoryModel.findOne({
      name: { $regex: `^${name}$`, $options: "i" }
    });

    if (existingCategory) {
      return res.status(400).send({ message: "Category already exists with this name." });
    }

    const imagePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const category = new categoryModel({
      name,
      image: imagePath,
    });

    await category.save();

    res.status(201).send({
      message: "Category created successfully.",
      category
    });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.status(200).send({
      message: "Categories retrieved successfully!",
      categories,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send({ message: "Internal server error" });
  }
};

const updateCategory = async (req, res) => {
  try {
    if (!checkAccess(req, res, ["Admin"])) return;

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Category id is required in query." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category id." });
    }

    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    const { name } = req.body;
    const updatedData = {};

    if (name) {
      const trimmedName = name.trim();

      const existingCategory = await categoryModel.findOne({
        _id: { $ne: id },
        name: { $regex: `^${trimmedName}$`, $options: "i" }
      });

      if (existingCategory) {
        return res.status(400).json({
          message: "Another category already exists with this name."
        });
      }

      updatedData.name = trimmedName;
    }

    if (req.file) {
      const imagePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      updatedData.image = imagePath;
    }

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        message: "No data provided to update."
      });
    }

    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true }
    );

    return res.status(200).json({
      message: "Category updated successfully.",
      category: updatedCategory
    });

  } catch (error) {
    console.error("Update category error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    if (!checkAccess(req, res, ["Admin"])) return;

    const categoryId = req.query.id;
    if (!categoryId) {
      return res.status(400).send({ message: "category id is required in query." });
    }

    const category = await categoryModel.findOne({ _id: categoryId });
    if (!category) {
      return res.status(404).send({ message: "Category not found." });
    }
    await categoryModel.deleteOne({ _id: categoryId });

    res.status(200).send({ message: "Category deleted successfully." });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {createCategory ,getCategories ,updateCategory ,deleteCategory}
