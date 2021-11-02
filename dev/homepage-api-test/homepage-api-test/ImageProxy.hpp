#pragma once

#ifndef _IMAGE_PROXY_HPP_
#define _IMAGE_PROXY_HPP_

#define OHTOAI_USE_BOOST

#include "ohtoai_base.hpp"
#include <iterator>
#include <fstream>
#include <set>
#include <algorithm>
#include <httplib.h>

namespace ohtoai
{
	struct ImageFileInfo;


	class ImageProxy
	{
		constexpr static auto SettingConfigPath{ "image_proxy.config" };
		inline const static log::Log Logger{ "image_proxy.log" };

#ifdef OHTOAI_LOCAL_TEST
		std::string fileStorageBase{ R"(storage/)" };
		std::string fileUrlBase{ R"(//localhost/img/)" };
		std::string thumbStorageBase{ R"(storage/thumb/)" };
		std::string thumbUrlBase{ R"(//localhost/img/thumb/)" };
#else
		std::string fileStorageBase{ R"(/home/ohtoai/html/assets/img/storage/)" };
		std::string fileUrlBase{ R"(//ohtoai.top/img/)" };
		std::string thumbStorageBase{ R"(/home/ohtoai/html/assets/img/storage/thumb/)" };
		std::string thumbUrlBase{ R"(//ohtoai.top/img/thumb/)" };
#endif
		std::string assemblyPath{ "assembly.dat" };


		OHTOAI_DEFINE_TYPE_INTRUSIVE(ImageProxy, fileStorageBase, fileUrlBase, thumbStorageBase, thumbUrlBase, assemblyPath);
	public:
		OHTOAI_DEFINE_TYPE_GETTER_INTRUSIVE(fileUrlBase, FileUrlBase);
		OHTOAI_DEFINE_TYPE_GETTER_INTRUSIVE(fileStorageBase, FileStorageBase);
		OHTOAI_DEFINE_TYPE_GETTER_INTRUSIVE(thumbUrlBase, ThumbUrlBase);
		OHTOAI_DEFINE_TYPE_GETTER_INTRUSIVE(thumbStorageBase, ThumbStorageBase);
		OHTOAI_DEFINE_TYPE_GETTER_SETTER_INTRUSIVE(assemblyPath, AssemblyPath);

		friend struct ImageFileInfo;
	private:
		ImageProxy(const ImageProxy&) = default;
		ImageProxy& operator = (const ImageProxy&) = default;

		ImageProxy()
		{
			::srand(static_cast<unsigned int>(::time(nullptr)));
			LOG_INFO("[[Image Proxy started.]]");
			loadConfig();
		}

		const std::string mergeImageStorage(std::string storage)
		{
			return getFileStorageBase() + storage;
		}

		const std::string mergeImageUrl(std::string storage)
		{
			return getFileUrlBase() + storage;
		}

		const std::string mergeThumbStorage(std::string storage)
		{
			return getThumbStorageBase() + storage;
		}

		const std::string mergeThumbUrl(std::string storage)
		{
			return getThumbUrlBase() + storage;
		}

	public:
		static ImageProxy& instance();
	public:
		std::vector<const ImageFileInfo*> fetchImageSet(std::set<std::string> authors = {}, std::set<std::string> tags = {}) const;

		std::string viewImageHtmlPage(std::string fileUrl)const;

		void loadConfig();
		void saveConfig(bool sync = false);
		void loadData();
		void saveData(bool sync = false);
		void syncWithFile();
		int fixError();

		std::string viewImageHtmlPage(const ImageFileInfo& info)const;

		ImageFileInfo createImageFile() const;

		const ImageFileInfo* storageImage(ImageFileInfo&& info, std::string&& content, std::string&&thumb);

		void removeImage(std::vector<const ImageFileInfo*> infos);

		const ImageFileInfo* fetchImage(std::string fileName);

		virtual ~ImageProxy();
	protected:
		std::vector<ImageFileInfo> imageFileInfoList;
	};
	
	struct ImageFileInfo
	{
	protected:
		std::string uid{ "00000000-0000-0000-0000-000000000000" };	// uid
		std::string name{ "null" };         // origin name
		std::string time{ "null" };			// time
		std::string author{ "null" };		// author
		std::string type{ "png" };			// type
		size_t size{};						// file size
		int width{};						// image width
		int height{};						// image height
		std::set<std::string> tags;			// tags

		mutable std::string storage{};		// [generated] storage file name
		mutable std::string thumb_storage{};// [generated] storage file name
		mutable std::string url{};			// [generated] url
		mutable std::string thumb_url{};	// [generated] thumb url
	public:
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(uid, UID);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(name, Name);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(time, Time);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(author, Author);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(width, Width);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(height, Height);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(type, Type);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(size, Size);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(tags, Tags);

		const std::string& getStorage() const
		{
			if (storage.empty())
				storage = getUID() + '.' + (getType().empty() ? "png" : getType());
			return storage;
		}
		const std::string& getThumbStorage() const
		{
			if (thumb_storage.empty())
				thumb_storage = getUID() + ".png";
			return thumb_storage;
		}

		const std::string& getUrl() const
		{
			if (url.empty())
				url = ImageProxy::instance().mergeImageUrl(getStorage());		
			return url;
		}
		const std::string& getThumbUrl() const
		{
			if (thumb_url.empty())
				thumb_url = ImageProxy::instance().mergeThumbUrl(getThumbStorage());
			return thumb_url;
		}
		
		void removeThumb()
		{
			thumb_url.clear();
			thumb_storage.clear();
		}

		void completeInfo()
		{
			setTime(time::getFormatedServerTime(0, false));
			storage = getUID() + '.' + (getType().empty() ? "png" : getType());
			thumb_storage = getUID() + '.' + "png";
			url = ImageProxy::instance().mergeImageUrl(getStorage());		
			thumb_url = ImageProxy::instance().mergeThumbUrl(getThumbStorage());
		}
		OHTOAI_DEFINE_TYPE_INTRUSIVE(ImageFileInfo, uid, name, time, author, width, height, type, size, tags);
	};
	
	inline std::vector<const ImageFileInfo*> ImageProxy::fetchImageSet(std::set<std::string> authors, std::set<std::string> tags) const
	{
		std::vector<const ImageFileInfo*> limitedFileInfos;
		for (const auto& info : imageFileInfoList)
		{
			bool ifAllLimitMatched = true;

			if (!authors.empty() && authors.find(info.getAuthor()) == authors.end())
				continue;

			if (!tags.empty() && !std::includes(info.getTags().begin(), info.getTags().end(), tags.begin(), tags.end()))
				continue;

			// todo
			limitedFileInfos.push_back(&info);
		}
		return limitedFileInfos;
	}

	inline std::string ImageProxy::viewImageHtmlPage(std::string fileUrl) const
	{
		return std::string{ R"(<!DOCTYPE html><html lang="en"><style>*{border:0;margin:0;width:100%;height:100%}*::-webkit-scrollbar{display:none}</style><iframe src=")" } + fileUrl + R"("></iframe></html>")";
	}

	inline void ImageProxy::loadConfig() {
		std::ifstream ifs(SettingConfigPath);
		if (!ifs)
		{
			LOG_INFO("Config missing.");
			saveConfig(true);
		}
		else
		{
			std::istreambuf_iterator<char> beg(ifs), end;
			from_json(nlohmann::json::parse(std::string(beg, end)), *this);
			LOG_INFO("Config readed.");
		}

		LOG_INFO("File storage at", getFileStorageBase());
		LOG_INFO("Thumb storage at", getThumbStorageBase());
		LOG_INFO("Assembly at", getAssemblyPath());
		LOG_INFO("File url at", getFileUrlBase());
		LOG_INFO("Thumb url at", getThumbUrlBase());
		if (!file::access(getFileStorageBase()))
		{
			file::createDirectoryRecursively(getFileStorageBase());
			LOG_INFO("Create folder", getFileStorageBase());
		}

		if (!file::access(getThumbStorageBase()))
		{
			file::createDirectoryRecursively(getThumbStorageBase());
			LOG_INFO("Create folder", getThumbStorageBase());
		}

		loadData();
	}

	inline void ImageProxy::saveConfig(bool sync)
	{
		std::thread th{
			[=] {
					nlohmann::json j = *this;
					auto storageData{ j.dump(4) };
					std::ofstream ofs(SettingConfigPath);
					ofs.write(storageData.data(), storageData.size());
					ofs.close();
					LOG_INFO("Config saved.");
				}
		};
		if(sync)
			th.join();
		else
			th.detach();
	}

	inline void ImageProxy::loadData()
	{
		std::ifstream ifs(getAssemblyPath());
		if (!ifs)
		{
			LOG_INFO("Assembly missing.");
			saveData(true);
		}
		else
		{
			std::istreambuf_iterator<char> beg(ifs), end;
			nlohmann::json::parse(std::string(beg, end)).get_to(imageFileInfoList);
			LOG_INFO("Assembly readed.");
		}
	}

	inline void ImageProxy::saveData(bool sync)
	{
		std::thread th{
			[=] {
					nlohmann::json j = imageFileInfoList;
					auto storageData{ j.dump() };
					std::ofstream ofs(getAssemblyPath());
					ofs.write(storageData.data(), storageData.size());
					ofs.close();
					LOG_INFO("Assembly saved.");
				}
		};
		if(sync)
			th.join();
		else
			th.detach();
	}

	inline void ImageProxy::syncWithFile()
	{
		bool ifUpdate = false;
		for (auto it = imageFileInfoList.begin(); it != imageFileInfoList.end();)
		{
			if (!file::access(mergeImageStorage(it->getStorage())))
			{
				it = imageFileInfoList.erase(it);
				ifUpdate = true;
			}
			else
				it++;
		}
		if (ifUpdate)
			saveData();
	}

	inline int ImageProxy::fixError()
	{
		int cnt = 0;
		for (auto& img : imageFileInfoList)
		{
			if (img.getStorage().empty())
			{
				img.setStorage(ohtoai::string::split(img.getUrl(), "/").back());
				++cnt;
			}
			if (img.getThumbStorage().empty())
			{
				img.setThumbStorage(ohtoai::string::split(img.getThumbUrl(), "/").back());
				++cnt;
			}
		}

		return 0;
	}

	inline std::string ImageProxy::viewImageHtmlPage(const ImageFileInfo& info) const
	{
		return viewImageHtmlPage(info.getUrl());
	}

	inline ImageFileInfo ImageProxy::createImageFile() const
	{
		ImageFileInfo info;
		info.setUID(uuid::generateUUID());
		return info;
	}

	inline const ImageFileInfo* ImageProxy::storageImage(ImageFileInfo&& info, std::string&& content, std::string&& thumb)
	{
		// storage
		info.completeInfo();

		// save file thread
		std::thread{ [=](std::string storage, std::string&& content)
			{
				std::ofstream ofs(mergeImageStorage(storage), std::ios::binary);
				ofs.write(content.data(), content.size());
				ofs.close();
				LOG_INFO(storage, "Saved[", content.size(), "Bytes].");
			}, info.getStorage(), std::forward<std::string>(content) }.detach();

			if (!thumb.empty())
			{
				std::thread{ [=](std::string storage, std::string&& thumb)
					{
						std::ofstream ofs(mergeThumbStorage(storage), std::ios::binary);
						ofs.write(thumb.data(), thumb.size());
						ofs.close();
						LOG_INFO("Thumb", storage, "Saved[", thumb.size(), "Bytes].");
					}, info.getThumbStorage(), std::forward<std::string>(thumb) }.detach();
			}
			else
			{
				info.removeThumb();
			}

		LOG_INFO(info.getUID(), "["+info.getName()+"] uploaded.", std::to_string(info.getWidth()) + "x" + std::to_string(info.getHeight()), "author:", info.getAuthor(), "tags:", nlohmann::json(info.getTags()).dump());
		imageFileInfoList.push_back(std::forward<ImageFileInfo>(info));

		// save data
		saveData();

		return &imageFileInfoList.back();
	}

	inline void ImageProxy::removeImage(std::vector<const ImageFileInfo*> infos)
	{
		bool ifDelete = false;
		for (auto info : infos)
		{
			if (info != nullptr)
			{
				ifDelete = true;
				int error = 0;
				error = ::remove(mergeImageStorage(info->getStorage()).c_str());
				LOG_INFO("Delete image", info->getStorage(), "return", error);
				error = ::remove(mergeThumbStorage(info->getThumbStorage()).c_str());
				LOG_INFO("Delete thumb", info->getThumbStorage(), "return", error);
			}
		}
		if (ifDelete)
			syncWithFile();
	}

	inline const ImageFileInfo* ImageProxy::fetchImage(std::string uid)
	{
		for (auto& info : imageFileInfoList)
		{
			if (info.getUID() == uid)
				return &info;
		}
		return nullptr;
	}

	inline ImageProxy::~ImageProxy()
	{
		saveConfig(true);
		saveData(true);
		
		LOG_INFO("[[Image Proxy stopped.]]");
	}

	inline ImageProxy& ImageProxy::instance()
	{
		static ImageProxy _instance;
		return _instance;
	}
}

#endif // _IMAGE_PROXY_HPP_