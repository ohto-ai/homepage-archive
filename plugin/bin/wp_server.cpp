#include <httplib.h>
#include <json.hpp>

#ifdef _WIN32
#include <io.h>
#else

#include <sys/types.h>
#include <dirent.h>
#include <errno.h>
#endif

std::vector<std::pair<std::string, int>> listFiles(std::string dir);

struct WallpaperFileInfo
{
	std::string name;
	std::string url;
	size_t size;
	std::string age;
}

int main()
{
	httplib::Server s;
	std::vector<std::pair<std::string, int>> wallpaperFileList;

#ifdef _WIN32
	const std::string wallpaperFilePath{ R"(D:\Documents\Pictures\WallPaper\)" };
	const std::string wallpaperUrlPath{R"("//localhost/wallpaper/")"};
#else
	const std::string wallpaperFilePath{ R"(/home/ohtoai/html/assets/img/wallpaper/)" };
	const std::string wallpaperUrlPath{R"("//thatboy.info/wallpaper/")"};
#endif

	srand(time(nullptr));

	auto loadWallpaperFileList = [&]
	{
		wallpaperFileList = listFiles(wallpaperFilePath);
		std::cout << "INFO: " << wallpaperFileList.size() << " wallpapers loaded." << std::endl;
		for (auto& [file, size] : wallpaperFileList)
		{
			std::cout << file << "\t" << size << " bytes" << std::endl;
		}
	};

	auto loadWallpaperAgeList = [&]
	{

	};

	auto viewImageHtml = [&](std::string fileUrl)
	{
		return std::string{ R"(<!DOCTYPE html><html lang="en"><style>*{border:0;margin:0;width:100%;height:100%}*::-webkit-scrollbar{display:none}</style><iframe src=")" } + fileUrl + R"("></iframe></html>")";
	};

	// load wallpapers
	loadWallpaperFileList();

	s.Get("/api/img", [&](const httplib::Request& req, httplib::Response& res)
		{
			nlohmann::json j;

			const auto invalidProcess = [&]
			{
				res.set_redirect("//thatboy.info/api/");
				//   nlohmann::json j;
				//   j["error"] = "invalid parameters";
				//   j["status"] = 403;
				//   j["usage"] = "op: [get]|upload|load region: [wallpaper]|avatar type<get-only>: [page]|list|dump|direct";
				//   res.status = 403;
				//   res.set_content(j.dump(4), "application/json");
			};

			std::string op{ "get" }, region{ "wallpaper" }, type{ "page" };

			// get parameters
			if (req.has_param("op"))
				op = req.get_param_value("op");
			if (req.has_param("region"))
				region = req.get_param_value("region");
			if (req.has_param("type"))
				type = req.get_param_value("type");

			std::cout << "op = " << op << std::endl;
			std::cout << "region = " << region << std::endl;
			std::cout << "type = " << type << std::endl;

			if (op == "get")
			{
				if (region == "wallpaper")
				{
					if (type == "page")
					{
						auto [fileName, fileSize] = wallpaperFileList.at(rand() % wallpaperFileList.size());
						auto url =  + fileName;
						res.set_content(viewImageHtml(url), "text/html");
					}
					else if (type == "direct")
					{
						auto [fileName, fileSize] = wallpaperFileList.at(rand() % wallpaperFileList.size());
						auto url = wallpaperUrlPath + fileName;
						res.set_redirect(url);
					}
					else if (type == "dump")
					{
						auto [fileName, fileSize] = wallpaperFileList.at(rand() % wallpaperFileList.size());
						auto url = wallpaperUrlPath + fileName;
						nlohmann::json j;
						j["name"] = fileName;
						j["size"] = fileSize;
						j["url"] = url;
						j["error"] = "ok";
						j["status"] = 200;
						res.set_content(j.dump(4), "application/json");
					}
					else if (type == "list")
					{
						nlohmann::json j;
						j["count"] = wallpaperFileList.size();

						nlohmann::json fileJ;
						for (auto& [fileName, fileSize] : wallpaperFileList)
						{
							try
							{
								fileJ["url"] = wallpaperUrlPath + fileName;
								fileJ["name"] = fileName;
								fileJ["size"] = fileSize;
								j["list"].push_back(fileJ);
							}
							catch (...)
							{
								std::cout << "ERROR: view file `" << fileName << "`failed" << std::endl;
							}
						}
						j["error"] = "ok";
						j["status"] = 200;
						res.set_content(j.dump(4), "application/json");
					}
					else
					{
						invalidProcess();
					}
				}
				else if (region == "avatar")
				{
					// todo
					nlohmann::json j;
					j["error"] = "incomplete function";
					j["status"] = 403;
					res.set_content(j.dump(4), "application/json");
				}
				else
				{
					invalidProcess();
				}
			}
			else if (op == "upload")
			{
				// todo
				nlohmann::json j;
				j["error"] = "incomplete function";
				j["status"] = 403;
				res.set_content(j.dump(4), "application/json");
			}
			else if (op == "load")
			{
				loadWallpaperFileList();

				nlohmann::json j;
				j["count"] = wallpaperFileList.size();
				j["error"] = "ok";
				j["status"] = 200;
				res.set_content(j.dump(4), "application/json");
			}
			else
			{
				invalidProcess();
			}
		});

	return s.listen("0.0.0.0", 8002);
}

std::vector<std::pair<std::string, int>> listFiles(std::string dir)
{
	std::vector<std::pair<std::string, int>> fileList;
#ifdef _WIN32
	intptr_t handle;
	_finddata_t findData;
	dir += "*";
	handle = _findfirst(dir.c_str(), &findData);
	if (handle == -1)
	{
		return {};
	}

	do
	{
		if (!(findData.attrib & _A_SUBDIR) && strcmp(findData.name, ".") && strcmp(findData.name, ".."))
			fileList.push_back(std::make_pair(findData.name, findData.size));
	} while (!_findnext(handle, &findData));

	_findclose(handle);

#else
	const auto getFileSize = [](std::string path)
	{
		struct stat statbuff;
		return stat(path.c_str(), &statbuff) < 0 ? -1 : statbuff.st_size;
	};

	DIR* dp;
	struct dirent* dirp;
	if ((dp = opendir(dir.c_str())) == NULL)
	{
		return {};
	}

	while ((dirp = readdir(dp)) != NULL)
	{
		if (strcmp(dirp->d_name, ".") && strcmp(dirp->d_name, ".."))
			fileList.push_back(std::make_pair(dirp->d_name, getFileSize(dir + dirp->d_name)));
	}
	closedir(dp);
#endif

	return fileList;
}