import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'models/user/user.schema';
import { UserProfile } from 'models/user/userProfile.schema';
import { CreateUserProfileDTO } from './dto/create-user-profile.dto';
import { UpdateUserProfileDTO } from './dto/update-user-profile.dto';
import { UserProfileResponseDTO } from './dto/get-user-profile.dto';
import { uploadBufferToCloudinary } from 'src/utils/upload/cloudinary';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserProfile.name) private userProfileModel: Model<UserProfile>,
  ) {}

  private transformUserProfile(userProfile: UserProfile): UserProfileResponseDTO {
    let userIdString: string;
    if (userProfile.userId instanceof Types.ObjectId) {
      userIdString = userProfile.userId.toString();
    } else if (userProfile.userId && typeof userProfile.userId === 'object' && '_id' in userProfile.userId) {
      userIdString = (userProfile.userId as any)._id.toString();
    } else {
      userIdString = String(userProfile.userId);
    }
    return {
      userId: userIdString,
      fullName: userProfile.fullName,
      phoneNumber: userProfile.phoneNumber,
      resumeUrl: userProfile.resumeUrl,
      skills: userProfile.skills || [],
      languages: userProfile.languages || [],
      currentLocation: userProfile.currentLocation,
      preferredJobLocation: userProfile.preferredJobLocation,
      gender: userProfile.gender,
      age: userProfile.age,
      linkedinUrl: userProfile.linkedinUrl,
      githubUrl: userProfile.githubUrl,
      portfolioUrl: userProfile.portfolioUrl,
      education: userProfile.education || [],
      experience: userProfile.experience || [],
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
    };
  }

  async createUserProfile(userId: string, createUserProfileDto: CreateUserProfileDTO, resume?: any): Promise<UserProfileResponseDTO> {
    
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    
    const existingProfile = await this.userProfileModel.findOne({ userId: new Types.ObjectId(userId) });
    if (existingProfile) {
      throw new BadRequestException('User profile already exists');
    }

    // Upload resume to Cloudinary if provided and no resumeUrl present
    let resumeUrl = createUserProfileDto.resumeUrl;
    if (!resumeUrl && resume?.buffer) {
      const uploadResult = await uploadBufferToCloudinary(resume.buffer, {
        folder: 'resumes',
        resourceType: 'raw',
      });
      resumeUrl = uploadResult.secure_url;
    }

    // Create new profile
    const userProfile = new this.userProfileModel({
      userId: new Types.ObjectId(userId),
      ...createUserProfileDto,
      ...(resumeUrl ? { resumeUrl } : {}),
    });

    const savedProfile = await userProfile.save();

    // Update user's isProfileCompleted flag
    await this.userModel.findByIdAndUpdate(userId, { isProfileCompleted: true });

    return this.transformUserProfile(savedProfile);
  }

  async getUserProfile(userId: string): Promise<UserProfileResponseDTO> {
    const userProfile = await this.userProfileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'email role');

    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    return this.transformUserProfile(userProfile);
  }

  async updateUserProfile(userId: string, updateUserProfileDto: UpdateUserProfileDTO, resume?: any): Promise<UserProfileResponseDTO> {
    const userProfile = await this.userProfileModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    // Upload resume to Cloudinary if provided and no resumeUrl present in DTO
    let resumeUrl = updateUserProfileDto.resumeUrl;
    if (!resumeUrl && resume?.buffer) {
      const uploadResult = await uploadBufferToCloudinary(resume.buffer, {
        folder: 'resumes',
        resourceType: 'raw',
      });
      resumeUrl = uploadResult.secure_url;
    }

    // Update the profile
    const updatedProfile = await this.userProfileModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: { ...updateUserProfileDto, ...(resumeUrl ? { resumeUrl } : {}) } },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      throw new NotFoundException('User profile not found');
    }

    return this.transformUserProfile(updatedProfile);
  }

  async deleteUserProfile(userId: string): Promise<void> {
    const userProfile = await this.userProfileModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    await this.userProfileModel.deleteOne({ userId: new Types.ObjectId(userId) });

    // Update user's isProfileCompleted flag
    await this.userModel.findByIdAndUpdate(userId, { isProfileCompleted: false });
  }
} 