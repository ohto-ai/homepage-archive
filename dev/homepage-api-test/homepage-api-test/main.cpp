// #define OHTOAI_LOCAL_TEST
#include "ImageProxy.hpp"
#include <signal.h>

httplib::Server s;

void atExit(int sig = 0)
{
	LOG_DEBUG("Capture quit signal", sig);
	s.stop();
}

int main()
{
	signal(SIGINT, atExit);
	signal(SIGTERM, atExit);

	auto splitToSet = [](std::string list)
	{
		std::set<std::string> tags;
		auto vec {ohtoai::string::split(list, ",\\s*")};
		for(auto&tag:vec)
			if(!tag.empty())
				tags.emplace(tag);
		return tags;
	};

	
	auto& proxy = ohtoai::ImageProxy::instance();

	s.Get("/api/img", [&](const httplib::Request& req, httplib::Response& res)
		{
			LOG_INFO(req.method, ":", req.path, nlohmann::json(req.params).dump());
			nlohmann::json j;

			const auto invalidProcess = [&]
			{
				res.set_redirect("//api.ohtoai.top/");
			};

			const auto emptyProcess = [&]
			{
				res.set_content(proxy.viewImageHtmlPage("//ohtoai.top/404.html"), "text/html");
				res.status = 404;
			};

			std::string op{ "get" }, type{ "page" };

			// get parameters
			if (req.has_param("op"))
				op = req.get_param_value("op");
			if (req.has_param("type"))
				type = req.get_param_value("type");

			
			if (op == "get")
			{
				if (type == "page")
				{
					auto set = proxy.fetchImageSet(splitToSet(req.get_param_value("author")), splitToSet(req.get_param_value("tags")));
					if(set.empty())
						emptyProcess();
					else{
						auto info = set.at(rand() % set.size());
						res.set_content(proxy.viewImageHtmlPage(*info), "text/html");
					}
				}
				else if (type == "direct")
				{
					auto set = proxy.fetchImageSet(splitToSet(req.get_param_value("author")), splitToSet(req.get_param_value("tags")));	
					if(set.empty())
						emptyProcess();
					else{
						auto info = set.at(rand() % set.size());
						res.set_redirect(info->getUrl());
					}
				}
				else if (type == "dump")
				{
					auto set = proxy.fetchImageSet(splitToSet(req.get_param_value("author")), splitToSet(req.get_param_value("tags")));	
					if(set.empty())
						emptyProcess();
					else{
						auto info = set.at(rand() % set.size());
						res.set_content(nlohmann::json(*info).dump(4), "application/json");
					}
				}
				else if (type == "list")
				{
					nlohmann::json j;
					auto set = proxy.fetchImageSet(splitToSet(req.get_param_value("author")), splitToSet(req.get_param_value("tags")));
					j["count"] = set.size();

					for (auto& info : set)
					{
						j["list"].push_back(*info);
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
			else if(op == "sync")
			{
				proxy.syncWithFile();
				
				nlohmann::json j;
				auto set = proxy.fetchImageSet();
				j["count"] = set.size();

				for (auto& info : set)
				{
					j["list"].push_back(*info);
				}
				j["error"] = "ok";
				j["status"] = 200;
				res.set_content(j.dump(4), "application/json");
			}
			else if(op == "delete")
			{
				bool isUseId = req.has_param("uid");

				nlohmann::json j;

				if(isUseId)
				{
					auto uid = req.get_param_value("uid");
					proxy.removeImage({proxy.fetchImage(uid)});	
					j["uid"] = uid;
					j["error"] = "ok";
				}
				else
				{
					auto authors = splitToSet(req.get_param_value("author"));
					auto tags = splitToSet(req.get_param_value("tags"));
					if(!authors.empty()||!tags.empty())
					{
						auto list = proxy.fetchImageSet(authors, tags);
						j["count"] = list.size();
						proxy.removeImage(list);
						list = proxy.fetchImageSet(authors, tags);
						if(list.size() == 0)
							j["error"] = "ok";
						else
							j["error"] = "delete failed";
					}
					else
					{
						j["error"] = "need select author or tags";
					}
					j["author"] = authors;
					j["tags"] = tags;
				}

				j["status"] = 200;
				res.set_content(j.dump(4), "application/json");
			}
			else if(op == "reload")
			{
				proxy.loadConfig();
				
				nlohmann::json j;
				auto set = proxy.fetchImageSet();
				j["count"] = set.size();

				for (auto& info : set)
				{
					j["list"].push_back(*info);
				}
				j["error"] = "ok";
				j["status"] = 200;
				res.set_content(j.dump(4), "application/json");
			}
			else if(op == "refresh")
			{
				proxy.saveConfig();
				
				nlohmann::json j;
				j["error"] = "ok";
				j["status"] = 200;
				res.set_content(j.dump(4), "application/json");
			}
			else if(op == "upload")
			{
				res.set_redirect("//ohtoai.top/upload/");
			}
			else if(op ==  "shutdown")
			{
				if(req.get_param_value("key") == "thatboy0609")
				{
					nlohmann::json j;
					j["error"] = "ok";
					j["status"] = 200;
					res.set_content(j.dump(4), "application/json");
					atExit();
				}
				else
				{
					nlohmann::json j;
					j["error"] = "no permission";
					j["status"] = 403;
					res.set_content(j.dump(4), "application/json");
				}
			}
			else if (op == "fix")
			{
				nlohmann::json j;
				j["error"] = "ok";
				j["status"] = 200;
				j["fix"] = proxy.fixError();
				res.set_content(j.dump(4), "application/json");
			}
			else
			{
				invalidProcess();
			}
		});

	s.Post("/api/img", [&](const httplib::Request& req, httplib::Response& res)
		{
			LOG_INFO(req.method, ":", req.path, nlohmann::json(req.params).dump());
			nlohmann::json j;
			if (req.get_param_value("op") == "upload")
			{
				auto author = req.has_file("author") ? req.get_file_value("author").content
				: req.has_param("author") ? req.get_param_value("author") : "undefined";

				auto tags = splitToSet(req.get_file_value("tags").content);

				auto info{ std::move(proxy.createImageFile()) };
				info.setAuthor(author);
				info.setTags(tags);

				info.setWidth(ohtoai::string::stringTo<int>(req.get_file_value("width").content));
				info.setHeight(ohtoai::string::stringTo<int>(req.get_file_value("height").content));
				info.setType(req.has_file("type") ? req.get_file_value("type").content : "png");

				const auto& imageFormData = req.get_file_value("image");
				info.setName(imageFormData.filename);
				info.setSize(imageFormData.content.size());

				if (req.has_file("thumb"))
				{
					const auto& thumbFormData = req.get_file_value("thumb");

					j["img"] = *proxy.storageImage(std::move(info)
						, std::move(const_cast<std::string&>(imageFormData.content))
						, std::move(const_cast<std::string&>(thumbFormData.content)));
				}
				else
				{
					j["img"] = *proxy.storageImage(std::move(info)
						, std::move(const_cast<std::string&>(imageFormData.content))
						, "");
				}

				LOG_DEBUG("File content size after moving :", imageFormData.content.size());

				j["error"] = "ok";
				j["status"] = 200;
			}
			else
			{
				LOG_DEBUG("Unknown command", req.get_param_value("op"));
				j["error"] = "unknown command";
				j["status"] = 404;
			}

			auto ret = req.get_param_value("ret");
			if (ret == "text")
			{
				res.set_content(j["img"]["url"].get<std::string>(), "text/plain");
			}
			else if (ret == "direct" || ret == "redirect")
			{
				res.set_redirect(j["img"]["url"].get<std::string>());
			}	
			else
			{
				res.set_content(j.dump(4), "application/json");
			}
		});

	s.set_mount_point("/", ".");
#ifdef OHTOAI_LOCAL_TEST
	s.set_mount_point("/img", ohtoai::ImageProxy::instance().getFileStorageBase().c_str());
	s.set_mount_point("/", "../../../");
	LOG_INFO("List to port 80");
	if(!s.listen("0.0.0.0", 80))
		LOG_ERROR("Listen port 80 error");
#else 
	LOG_INFO("List to port 8002");
	if(!s.listen("0.0.0.0", 8002))
		LOG_ERROR("Listen port 8002 error");
#endif

}
